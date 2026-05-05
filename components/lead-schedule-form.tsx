"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { AddPropertyWorkflowPanel } from "@/components/add-property-workflow-panel";
import { AutoResizeTextarea } from "@/components/auto-resize-textarea";
import { CalendarLinkButton } from "@/components/calendar-link-button";
import { DateInputField } from "@/components/date-input-field";
import { DateTimePickerFields, DateTimePickerHandle } from "@/components/date-time-picker-fields";
import { InlineSpinner } from "@/components/inline-spinner";
import { TooltipShell } from "@/components/tooltip-shell";
import { emitAppToast } from "@/lib/client-toast";
import { updateLeadSchedule } from "@/lib/actions";
import { buildGoogleCalendarUrlFromDraft } from "@/lib/calendar";
import {
  fieldMaxLengths,
  getMaxLengthError,
  getOptionalDateError,
  getRequiredSelectError
} from "@/lib/form-validation";
import {
  getPriorityLabel,
  getSourceLabel,
  getStatusLabel,
  leadPriorityOptions,
  leadSourceOptions,
  leadStatusOptions
} from "@/lib/lead-utils";
import {
  formatPropertyListingPrice,
  getPropertyListingLayout
} from "@/lib/property-listing-utils";
import type { PropertyWorkflowDraft } from "@/lib/property-workflow";
import type { Lead, LeadWithProperties, PropertyListing } from "@/lib/types";

type FieldErrors = Partial<Record<string, string>>;
type ScheduleLocationType = "primary" | "propertyInterest" | "propertyListing" | "manualAddress";
type ScheduleLocationOption = {
  value: string;
  type: ScheduleLocationType;
  label: string;
  address: string;
  detail: string;
  propertyInterestId: string;
  propertyListingId: string;
};

type ScheduleFormValues = {
  status: string;
  priority: string;
  source: string;
  nextFollowUpDate: string;
  agentNotes: string;
};

const scheduleFieldOrder = ["status", "priority", "source", "nextFollowUpDate", "agentNotes"];

function getFieldError(name: keyof ScheduleFormValues, value: string) {
  switch (name) {
    case "status":
    case "priority":
    case "source":
      return getRequiredSelectError(value);
    case "nextFollowUpDate":
      return getOptionalDateError(value);
    case "agentNotes":
      return getMaxLengthError(value, fieldMaxLengths.agentNotes);
    default:
      return "";
  }
}

function buildErrors(values: ScheduleFormValues) {
  return Object.entries(values).reduce<FieldErrors>((current, [name, value]) => {
    const nextError = getFieldError(name as keyof ScheduleFormValues, value);

    if (!nextError) {
      return current;
    }

    return { ...current, [name]: nextError };
  }, {});
}

export function LeadScheduleForm({
  lead,
  propertyListings = [],
  isPreviewReadonly = false
}: {
  lead: LeadWithProperties;
  propertyListings?: PropertyListing[];
  isPreviewReadonly?: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const scheduleRef = useRef<DateTimePickerHandle>(null);
  const [selectedLocationValue, setSelectedLocationValue] = useState("primary");
  const [manualLocationDraft, setManualLocationDraft] = useState<PropertyWorkflowDraft | null>(null);
  const [attachLocationToLead, setAttachLocationToLead] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [values, setValues] = useState<ScheduleFormValues>({
    status: lead.status,
    priority: lead.priority,
    source: lead.source,
    nextFollowUpDate: lead.nextFollowUpDate,
    agentNotes: lead.agentNotes
  });
  const [scheduleState, setScheduleState] = useState({
    date: lead.showingDate,
    time: lead.showingTime,
    isValid: true,
    isPastDate: false
  });
  const primaryLocation: ScheduleLocationOption = {
    value: "primary",
    type: "primary",
    label: "Lead primary target",
    address: lead.propertyAddress,
    detail: "Use the address already saved on this customer.",
    propertyInterestId: "",
    propertyListingId: ""
  };
  const savedPropertyOptions = useMemo<ScheduleLocationOption[]>(
    () =>
      lead.propertyInterests.map((propertyInterest) => ({
        value: `propertyInterest:${propertyInterest.id}`,
        type: "propertyInterest",
        label: propertyInterest.listingTitle || propertyInterest.address,
        address: propertyInterest.address,
        detail: [
          propertyInterest.rent ? `Rent ${propertyInterest.rent}` : "",
          propertyInterest.beds ? `${propertyInterest.beds} bd` : "",
          propertyInterest.neighborhood
        ]
          .filter(Boolean)
          .join(" - ") || "Saved interested property",
        propertyInterestId: propertyInterest.id,
        propertyListingId: ""
      })),
    [lead.propertyInterests]
  );
  const selectedPropertyListing = useMemo(() => {
    if (!selectedLocationValue.startsWith("propertyListing:")) {
      return null;
    }

    const id = selectedLocationValue.replace("propertyListing:", "");
    return propertyListings.find((listing) => listing.id === id) || null;
  }, [propertyListings, selectedLocationValue]);
  const selectedInventoryOption = useMemo<ScheduleLocationOption | null>(
    () =>
      selectedPropertyListing
        ? {
            value: `propertyListing:${selectedPropertyListing.id}`,
            type: "propertyListing",
            label: selectedPropertyListing.title,
            address: selectedPropertyListing.address,
            detail: [
              formatPropertyListingPrice(selectedPropertyListing.price),
              getPropertyListingLayout(selectedPropertyListing),
              selectedPropertyListing.neighborhood
            ]
              .filter(Boolean)
              .join(" - "),
            propertyInterestId: "",
            propertyListingId: selectedPropertyListing.id
          }
        : null,
    [selectedPropertyListing]
  );
  const manualLocationOption = useMemo<ScheduleLocationOption | null>(
    () =>
      manualLocationDraft?.address
        ? {
            value: "manualAddress",
            type: "manualAddress",
            label: manualLocationDraft.listingTitle || "Typed address",
            address: manualLocationDraft.address,
            detail: [
              manualLocationDraft.neighborhood,
              manualLocationDraft.listingUrl ? "Listing link saved for this schedule" : "",
              "Typed or pasted address"
            ]
              .filter(Boolean)
              .join(" - "),
            propertyInterestId: "",
            propertyListingId: ""
          }
        : null,
    [manualLocationDraft]
  );
  const locationOptions = [
    primaryLocation,
    ...savedPropertyOptions,
    ...(selectedInventoryOption ? [selectedInventoryOption] : []),
    ...(manualLocationOption ? [manualLocationOption] : [])
  ];
  const selectedLocation =
    locationOptions.find((option) => option.value === selectedLocationValue) || primaryLocation;

  const calendarUrl =
    scheduleState.date && scheduleState.time && scheduleState.isValid
      ? buildGoogleCalendarUrlFromDraft({
          ...lead,
          propertyAddress: selectedLocation.address,
          showingDate: scheduleState.date,
          showingTime: scheduleState.time,
          status: values.status as Lead["status"],
          priority: values.priority as Lead["priority"],
          source: values.source as Lead["source"],
          nextFollowUpDate: values.nextFollowUpDate,
          agentNotes: values.agentNotes
        } as Lead)
      : null;

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("lead-calendar-url-change", {
        detail: {
          leadId: lead.id,
          calendarUrl
        }
      })
    );
  }, [calendarUrl, lead.id]);

  useEffect(() => {
    if (!scheduleState.date || !scheduleState.time) {
      return;
    }

    setValues((current) => {
      if (current.status === "closed" || current.status === "scheduled") {
        return current;
      }

      return { ...current, status: "scheduled" };
    });
    setErrors((current) => {
      const { status: _ignored, ...rest } = current;
      return rest;
    });
  }, [scheduleState.date, scheduleState.time]);

  const isFormValid = useMemo(
    () => Object.keys(buildErrors(values)).length === 0 && scheduleState.isValid,
    [scheduleState.isValid, values]
  );

  function updateField(name: keyof ScheduleFormValues, value: string) {
    setValues((current) => ({ ...current, [name]: value }));

    const nextError = getFieldError(name, value);
    setErrors((current) => {
      if (!nextError) {
        const { [name]: _ignored, ...rest } = current;
        return rest;
      }

      return { ...current, [name]: nextError };
    });
  }

  function focusFirstInvalid(nextErrors: FieldErrors) {
    for (const name of scheduleFieldOrder) {
      if (nextErrors[name]) {
        const field = formRef.current?.querySelector<HTMLElement>(`[data-field="${name}"]`);
        field?.focus();
        return;
      }
    }

    scheduleRef.current?.focusDate();
  }

  function validateForm() {
    const nextErrors = buildErrors(values);
    const isScheduleValid = scheduleRef.current?.validate() ?? true;

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      emitAppToast({ toastKey: "validation-error" });
      focusFirstInvalid(nextErrors);
      return false;
    }

    if (!isScheduleValid) {
      emitAppToast({ toastKey: "validation-error" });
      scheduleRef.current?.focusDate();
      return false;
    }

    return true;
  }

  function selectWorkflowLocation(draft: PropertyWorkflowDraft) {
    if (draft.propertyListingId) {
      setManualLocationDraft(null);
      setSelectedLocationValue(`propertyListing:${draft.propertyListingId}`);
      setAttachLocationToLead(true);
      emitAppToast({ message: "Showing location selected" });
      return;
    }

    if (draft.address) {
      setManualLocationDraft(draft);
      setSelectedLocationValue("manualAddress");
      setAttachLocationToLead(true);
      emitAppToast({ message: "Showing location selected" });
    }
  }

  function chooseLocation(value: string) {
    setSelectedLocationValue(value);

    if (value.startsWith("propertyListing:") || value === "manualAddress") {
      setAttachLocationToLead(true);
    }
  }

  return (
    <form
      ref={formRef}
      action={updateLeadSchedule}
      noValidate
      onSubmit={(event) => {
        if (!validateForm()) {
          event.preventDefault();
        }
      }}
      className="mt-5 grid gap-4"
    >
      <input type="hidden" name="id" value={lead.id} />
      <input type="hidden" name="showingLocationType" value={selectedLocation.type} />
      <input type="hidden" name="showingLocationAddress" value={selectedLocation.address} />
      <input type="hidden" name="propertyInterestId" value={selectedLocation.propertyInterestId} />
      <input type="hidden" name="propertyListingId" value={selectedLocation.propertyListingId} />
      <input type="hidden" name="attachShowingLocationToLead" value={attachLocationToLead ? "true" : "false"} />
      <input type="hidden" name="manualShowingTitle" value={manualLocationDraft?.listingTitle || ""} />
      <input type="hidden" name="manualShowingAddress" value={manualLocationDraft?.address || ""} />
      <input type="hidden" name="manualShowingSource" value={manualLocationDraft?.source || "other"} />
      <input type="hidden" name="manualShowingUrl" value={manualLocationDraft?.listingUrl || ""} />
      <input type="hidden" name="manualShowingPrice" value={manualLocationDraft?.rent || ""} />
      <input type="hidden" name="manualShowingBeds" value={manualLocationDraft?.beds || ""} />
      <input type="hidden" name="manualShowingBaths" value={manualLocationDraft?.baths || ""} />
      <input type="hidden" name="manualShowingNeighborhood" value={manualLocationDraft?.neighborhood || ""} />
      <input type="hidden" name="manualShowingNotes" value={manualLocationDraft?.agentNotes || ""} />

      <div className="rounded-3xl border border-line/70 bg-slate-50/90 p-4">
        <p className="app-kicker">Showing Location</p>
        <p className="mt-2 text-sm font-semibold leading-6 text-ink">{selectedLocation.address}</p>
        <p className="mt-2 text-xs leading-5 text-slate-500">{selectedLocation.detail}</p>
      </div>

      <div className="rounded-3xl border border-line/70 bg-white/90 p-4">
        <p className="text-sm font-semibold text-ink">Choose where this showing is happening</p>
        <div className="mt-3 grid gap-3">
          <ScheduleLocationRadio
            option={primaryLocation}
            checked={selectedLocationValue === primaryLocation.value}
            onChange={chooseLocation}
          />

          {savedPropertyOptions.length > 0 ? (
            <div className="grid gap-2">
              <p className="app-kicker">Saved properties</p>
              {savedPropertyOptions.map((option) => (
                <ScheduleLocationRadio
                  key={option.value}
                  option={option}
                  checked={selectedLocationValue === option.value}
                  onChange={chooseLocation}
                />
              ))}
            </div>
          ) : null}

          {manualLocationOption ? (
            <ScheduleLocationRadio
              option={manualLocationOption}
              checked={selectedLocationValue === manualLocationOption.value}
              onChange={chooseLocation}
            />
          ) : null}

          {selectedInventoryOption ? (
            <ScheduleLocationRadio
              option={selectedInventoryOption}
              checked={selectedLocationValue === selectedInventoryOption.value}
              onChange={chooseLocation}
            />
          ) : null}

          <AddPropertyWorkflowPanel
            lead={lead}
            propertyListings={propertyListings}
            onApply={selectWorkflowLocation}
            compact
          />

          {selectedLocation.type === "propertyListing" || selectedLocation.type === "manualAddress" ? (
            <label className="flex items-start gap-3 rounded-2xl border border-line/80 bg-slate-50/90 px-4 py-3">
              <input
                type="checkbox"
                checked={attachLocationToLead}
                onChange={(event) => setAttachLocationToLead(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-line accent-blue-600"
              />
              <span className="text-sm leading-6 text-slate-700">
                <span className="font-semibold text-ink">Also save this property to this customer</span>
                <br />
                Adds it to the interested properties list if it is not already attached.
              </span>
            </label>
          ) : null}

          <p className="text-xs leading-5 text-slate-500">
            Current data model saves one showing per lead. Choose one property now; multi-stop
            tours will need a dedicated tour-stop model later.
          </p>
        </div>
      </div>

      <ValidatedSelect
        label="Status"
        name="status"
        value={values.status}
        options={leadStatusOptions.map((option) => ({
          value: option,
          label: getStatusLabel(option)
        }))}
        error={errors.status}
        onChange={updateField}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <ValidatedSelect
          label="Priority"
          name="priority"
          value={values.priority}
          options={leadPriorityOptions.map((option) => ({
            value: option,
            label: getPriorityLabel(option)
          }))}
          error={errors.priority}
          onChange={updateField}
        />

        <ValidatedSelect
          label="Lead source"
          name="source"
          value={values.source}
          options={leadSourceOptions.map((option) => ({
            value: option,
            label: getSourceLabel(option)
          }))}
          error={errors.source}
          onChange={updateField}
        />
      </div>

      <DateTimePickerFields
        ref={scheduleRef}
        dateName="showingDate"
        timeName="showingTime"
        allowPastDateOverrideName="showingDateAllowPastOverride"
        dateLabel="Showing date"
        timeLabel="Showing time"
        dateAriaLabel="showing date"
        timeAriaLabel="showing time"
        initialDate={lead.showingDate}
        initialTime={lead.showingTime}
        onValueChange={setScheduleState}
      />

      <DateInputField
        label="Next follow-up date"
        name="nextFollowUpDate"
        value={values.nextFollowUpDate}
        error={errors.nextFollowUpDate}
        dataField="nextFollowUpDate"
        helperText="Use MM/DD/YYYY"
        onChange={(value) => updateField("nextFollowUpDate", value)}
      />

      <label className="flex min-w-0 flex-col gap-2">
        <span className="text-sm font-medium text-slate-700">Agent notes</span>
        <AutoResizeTextarea
          name="agentNotes"
          rows={5}
          value={values.agentNotes}
          maxLength={fieldMaxLengths.agentNotes}
          data-field="agentNotes"
          aria-label="Agent notes"
          aria-invalid={Boolean(errors.agentNotes)}
          aria-describedby={errors.agentNotes ? "agentNotes-help agentNotes-error" : "agentNotes-help"}
          onChange={(event) => updateField("agentNotes", event.target.value)}
          className={`app-textarea ${errors.agentNotes ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100" : ""}`}
        />
        <p id="agentNotes-help" className="text-xs text-slate-500">
          Use this for access notes, parking tips, or showing reminders.
        </p>
        <p id="agentNotes-error" className="min-h-[1.25rem] text-xs font-medium text-rose-600" aria-live="polite">
          {errors.agentNotes || ""}
        </p>
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex flex-col gap-2">
          {!isFormValid ? (
            <p className="text-xs font-medium text-slate-500">
              Fix the highlighted fields before saving updates.
            </p>
          ) : null}
          <TooltipShell
            disabled={isPreviewReadonly}
            message="This preview workspace is read-only. Use a live workspace to update leads."
          >
            <UpdateLeadButton disabled={isPreviewReadonly || !isFormValid} />
          </TooltipShell>
        </div>
        <CalendarLinkButton
          calendarUrl={calendarUrl}
          missingMessage="Add a valid showing date and time to enable Google Calendar."
        />
      </div>
    </form>
  );
}

function UpdateLeadButton({ disabled = false }: { disabled?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="app-button-primary disabled:cursor-not-allowed disabled:opacity-55"
    >
      {pending ? (
        <>
          <InlineSpinner />
          <span>Saving Update...</span>
        </>
      ) : (
        "Update Lead"
      )}
    </button>
  );
}

function ScheduleLocationRadio({
  option,
  checked,
  onChange
}: {
  option: ScheduleLocationOption;
  checked: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label
      className={`cursor-pointer rounded-2xl border px-4 py-3 transition ${
        checked ? "border-accent bg-accentSoft/70" : "border-line/80 bg-slate-50/80 hover:border-accent"
      }`}
    >
      <div className="flex items-start gap-3">
        <input
          type="radio"
          name="location-picker"
          value={option.value}
          checked={checked}
          onChange={() => onChange(option.value)}
          className="mt-1 h-4 w-4 accent-blue-600"
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">{option.label}</p>
          <p className="mt-1 text-xs leading-5 text-slate-600">{option.address}</p>
          <p className="mt-1 text-xs text-slate-500">{option.detail}</p>
        </div>
      </div>
    </label>
  );
}

function ValidatedSelect({
  label,
  name,
  value,
  options,
  error,
  onChange
}: {
  label: string;
  name: keyof ScheduleFormValues;
  value: string;
  options: Array<{ value: string; label: string }>;
  error?: string;
  onChange: (name: keyof ScheduleFormValues, value: string) => void;
}) {
  const helpId = `${name}-help`;
  const errorId = `${name}-error`;

  return (
    <label className="flex min-w-0 flex-col gap-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <select
        name={name}
        value={value}
        data-field={name}
        aria-label={label}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${helpId} ${errorId}` : helpId}
        onChange={(event) => onChange(name, event.target.value)}
        className={`app-input ${error ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100" : ""}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <p id={helpId} className="text-xs text-slate-500">
        Required field.
      </p>
      <p id={errorId} className="min-h-[1.25rem] text-xs font-medium text-rose-600" aria-live="polite">
        {error || ""}
      </p>
    </label>
  );
}
