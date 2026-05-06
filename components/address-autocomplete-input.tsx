"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

export type AddressAutocompleteSelection = {
  formattedAddress: string;
  title: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
  placeId: string;
};

type AutocompletePrediction = {
  description: string;
  place_id: string;
  structured_formatting?: {
    main_text?: string;
    secondary_text?: string;
  };
};

type AddressComponent = {
  long_name: string;
  short_name: string;
  types: string[];
};

type PlaceResult = {
  formatted_address?: string;
  name?: string;
  address_components?: AddressComponent[];
};

type GooglePlacesNamespace = {
  AutocompleteService: new () => {
    getPlacePredictions: (
      request: Record<string, unknown>,
      callback: (predictions: AutocompletePrediction[] | null, status: string) => void
    ) => void;
  };
  PlacesService: new (element: HTMLDivElement) => {
    getDetails: (
      request: Record<string, unknown>,
      callback: (place: PlaceResult | null, status: string) => void
    ) => void;
  };
  AutocompleteSessionToken?: new () => unknown;
  PlacesServiceStatus?: {
    OK: string;
    ZERO_RESULTS: string;
  };
};

type GoogleMapsWindow = Window & {
  google?: {
    maps?: {
      places?: GooglePlacesNamespace;
    };
  };
  __showingsGoogleMapsPlacesReady?: () => void;
  __showingsGoogleMapsPlacesPromise?: Promise<void>;
};

const googleMapsScriptId = "showings-google-maps-places";

function getGooglePlaces() {
  if (typeof window === "undefined") {
    return undefined;
  }

  return (window as GoogleMapsWindow).google?.maps?.places;
}

function loadGoogleMapsPlaces(apiKey: string) {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only load in the browser."));
  }

  const browserWindow = window as GoogleMapsWindow;

  if (getGooglePlaces()?.AutocompleteService) {
    return Promise.resolve();
  }

  if (browserWindow.__showingsGoogleMapsPlacesPromise) {
    return browserWindow.__showingsGoogleMapsPlacesPromise;
  }

  browserWindow.__showingsGoogleMapsPlacesPromise = new Promise<void>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      reject(new Error("Google Maps Places did not load."));
    }, 10000);

    function finish() {
      window.clearTimeout(timeoutId);

      if (getGooglePlaces()?.AutocompleteService) {
        resolve();
      } else {
        reject(new Error("Google Maps Places library is unavailable."));
      }
    }

    browserWindow.__showingsGoogleMapsPlacesReady = finish;

    const existingScript = document.getElementById(googleMapsScriptId) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener("load", finish, { once: true });
      existingScript.addEventListener(
        "error",
        () => {
          window.clearTimeout(timeoutId);
          reject(new Error("Google Maps Places failed to load."));
        },
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.id = googleMapsScriptId;
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey
    )}&loading=async&libraries=places&callback=__showingsGoogleMapsPlacesReady`;
    script.onerror = () => {
      window.clearTimeout(timeoutId);
      reject(new Error("Google Maps Places failed to load."));
    };

    document.head.appendChild(script);
  }).catch((error) => {
    browserWindow.__showingsGoogleMapsPlacesPromise = undefined;
    throw error;
  });

  return browserWindow.__showingsGoogleMapsPlacesPromise;
}

function getComponent(components: AddressComponent[] | undefined, type: string, useShortName = false) {
  const component = components?.find((item) => item.types.includes(type));
  return useShortName ? component?.short_name || "" : component?.long_name || "";
}

function getNeighborhood(components: AddressComponent[] | undefined) {
  return (
    getComponent(components, "neighborhood") ||
    getComponent(components, "sublocality") ||
    getComponent(components, "sublocality_level_1") ||
    getComponent(components, "locality")
  );
}

function buildSelectionFromPlace(place: PlaceResult | null, fallback: AutocompletePrediction): AddressAutocompleteSelection {
  const formattedAddress = place?.formatted_address || fallback.description;
  const components = place?.address_components;

  return {
    formattedAddress,
    title: formattedAddress,
    neighborhood: getNeighborhood(components),
    city: getComponent(components, "locality") || getComponent(components, "postal_town"),
    state: getComponent(components, "administrative_area_level_1", true),
    postalCode: getComponent(components, "postal_code"),
    placeId: fallback.place_id
  };
}

export function AddressAutocompleteInput({
  label,
  value,
  onChange,
  onSelect,
  placeholder = "Start typing an address",
  helperText
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (selection: AddressAutocompleteSelection) => void;
  placeholder?: string;
  helperText?: string;
}) {
  const inputId = useId();
  const listboxId = `${inputId}-suggestions`;
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const autocompleteServiceRef = useRef<InstanceType<GooglePlacesNamespace["AutocompleteService"]> | null>(null);
  const placesServiceRef = useRef<InstanceType<GooglePlacesNamespace["PlacesService"]> | null>(null);
  const sessionTokenRef = useRef<unknown>(null);
  const latestRequestRef = useRef(0);
  const lastSelectedValueRef = useRef("");
  const [loadState, setLoadState] = useState<"disabled" | "loading" | "ready" | "failed">(
    apiKey ? "loading" : "disabled"
  );
  const [predictions, setPredictions] = useState<AutocompletePrediction[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const autocompleteEnabled = Boolean(apiKey) && loadState === "ready";

  useEffect(() => {
    if (!apiKey) {
      setLoadState("disabled");
      return;
    }

    let isCancelled = false;

    setLoadState("loading");
    loadGoogleMapsPlaces(apiKey)
      .then(() => {
        if (isCancelled) {
          return;
        }

        const places = getGooglePlaces();

        if (!places?.AutocompleteService || !places.PlacesService) {
          setLoadState("failed");
          return;
        }

        autocompleteServiceRef.current = new places.AutocompleteService();
        placesServiceRef.current = new places.PlacesService(document.createElement("div"));
        sessionTokenRef.current = places.AutocompleteSessionToken ? new places.AutocompleteSessionToken() : null;
        setLoadState("ready");
      })
      .catch(() => {
        if (!isCancelled) {
          setLoadState("failed");
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [apiKey]);

  useEffect(() => {
    if (!autocompleteEnabled || value.trim().length < 3 || value === lastSelectedValueRef.current) {
      setPredictions([]);
      setActiveIndex(-1);
      setIsOpen(false);
      return;
    }

    const requestId = latestRequestRef.current + 1;
    latestRequestRef.current = requestId;

    const timerId = window.setTimeout(() => {
      autocompleteServiceRef.current?.getPlacePredictions(
        {
          input: value.trim(),
          componentRestrictions: { country: "us" },
          types: ["address"],
          sessionToken: sessionTokenRef.current || undefined
        },
        (nextPredictions, status) => {
          if (latestRequestRef.current !== requestId) {
            return;
          }

          const isOk = status === "OK" || status === getGooglePlaces()?.PlacesServiceStatus?.OK;

          if (!isOk || !nextPredictions?.length) {
            setPredictions([]);
            setActiveIndex(-1);
            setIsOpen(false);
            return;
          }

          setPredictions(nextPredictions.slice(0, 5));
          setActiveIndex(-1);
          setIsOpen(true);
        }
      );
    }, 250);

    return () => window.clearTimeout(timerId);
  }, [autocompleteEnabled, value]);

  function selectPrediction(prediction: AutocompletePrediction) {
    const fallbackSelection = buildSelectionFromPlace(null, prediction);

    lastSelectedValueRef.current = fallbackSelection.formattedAddress;
    onChange(fallbackSelection.formattedAddress);
    setPredictions([]);
    setActiveIndex(-1);
    setIsOpen(false);

    if (!placesServiceRef.current || !prediction.place_id) {
      onSelect(fallbackSelection);
      return;
    }

    placesServiceRef.current.getDetails(
      {
        placeId: prediction.place_id,
        fields: ["formatted_address", "address_components", "name"],
        sessionToken: sessionTokenRef.current || undefined
      },
      (place, status) => {
        const isOk = status === "OK" || status === getGooglePlaces()?.PlacesServiceStatus?.OK;
        const selection = isOk ? buildSelectionFromPlace(place, prediction) : fallbackSelection;

        lastSelectedValueRef.current = selection.formattedAddress;
        onChange(selection.formattedAddress);
        onSelect(selection);

        const places = getGooglePlaces();
        sessionTokenRef.current = places?.AutocompleteSessionToken ? new places.AutocompleteSessionToken() : null;
      }
    );
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || predictions.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % predictions.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => (current <= 0 ? predictions.length - 1 : current - 1));
      return;
    }

    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      selectPrediction(predictions[activeIndex]);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);
      setActiveIndex(-1);
    }
  }

  function handleInputChange(nextValue: string) {
    if (nextValue !== lastSelectedValueRef.current) {
      lastSelectedValueRef.current = "";
    }

    onChange(nextValue);
  }

  const statusText =
    loadState === "disabled"
      ? "Address autocomplete can be connected later with a Google Maps key."
      : loadState === "failed"
        ? "Address autocomplete is unavailable. Manual entry still works."
        : loadState === "loading"
          ? "Loading address autocomplete. Manual entry still works."
          : helperText || "Start typing to see address suggestions, or enter the address manually.";

  return (
    <div className="relative flex min-w-0 flex-col gap-2">
      <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={inputId}
        type="text"
        value={value}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-activedescendant={activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
        autoComplete="off"
        placeholder={placeholder}
        onChange={(event) => handleInputChange(event.target.value)}
        onFocus={() => {
          if (autocompleteEnabled && predictions.length > 0) {
            setIsOpen(true);
          }
        }}
        onBlur={() => {
          window.setTimeout(() => setIsOpen(false), 120);
        }}
        onKeyDown={handleKeyDown}
        className="app-input"
      />

      {isOpen && predictions.length > 0 ? (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-[4.75rem] z-30 max-h-72 overflow-y-auto rounded-2xl border border-line bg-white p-2 shadow-panel"
        >
          {predictions.map((prediction, index) => (
            <li
              id={`${listboxId}-option-${index}`}
              key={prediction.place_id || prediction.description}
              role="option"
              aria-selected={index === activeIndex}
            >
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectPrediction(prediction)}
                className={`w-full rounded-xl px-3 py-2 text-left transition ${
                  index === activeIndex ? "bg-accentSoft text-ink" : "hover:bg-slate-50"
                }`}
              >
                <span className="block text-sm font-semibold text-ink">
                  {prediction.structured_formatting?.main_text || prediction.description}
                </span>
                {prediction.structured_formatting?.secondary_text ? (
                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    {prediction.structured_formatting.secondary_text}
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <p className="text-xs leading-5 text-slate-500">{statusText}</p>
    </div>
  );
}
