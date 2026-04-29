"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type InputHTMLAttributes } from "react";
import { useFormStatus } from "react-dom";
import { InlineSpinner } from "@/components/inline-spinner";
import { emitPropertyFormDirtyChange } from "@/components/property-back-link";
import { TooltipShell } from "@/components/tooltip-shell";
import { emitAppToast } from "@/lib/client-toast";
import { fieldMaxLengths, getMaxLengthError, getNumericError } from "@/lib/form-validation";
import { leadSourceOptions } from "@/lib/lead-utils";
import { getPropertyInterestSourceLabel } from "@/lib/property-interest-utils";

type AddPropertyField =
  | "listingTitle"
  | "address"
  | "rent"
  | "beds"
  | "baths"
  | "neighborhood"
  | "source"
  | "listingUrl"
  | "pros"
  | "cons"
  | "agentNotes";

type AddPropertyValues = Record<AddPropertyField, string>;
type FieldErrors = Partial<Record<AddPropertyField, string>>;
type TouchedFields = Partial<Record<AddPropertyField, boolean>>;

const propertyFieldNames: AddPropertyField[] = [
  "listingTitle",
  "address",
  "rent",
  "beds",
  "baths",
  "neighborhood",
  "source",
  "listingUrl",
  "pros",
  "cons",
  "agentNotes"
];

function readFormValues(form: HTMLFormElement): AddPropertyValues {
  const formData = new FormData(form);

  return propertyFieldNames.reduce<AddPropertyValues>((values, fieldName) => {
    values[fieldName] = String(formData.get(fieldName) ?? "");
    return values;
  }, {} as AddPropertyValues);
}

function hasEnteredPropertyData(values: AddPropertyValues) {
  return propertyFieldNames.some((fieldName) => values[fieldName].trim().length > 0);
}

function getFieldError(fieldName: AddPropertyField, value: string) {
  switch (fieldName) {
    case "listingTitle":
      return (!value.trim() ? "Listing title is required." : "") || getMaxLengthError(value, fieldMaxLengths.listingTitle);
    case "address":
      return (!value.trim() ? "Address is required." : "") || getMaxLengthError(value, fieldMaxLengths.address);
    case "rent":
      return getNumericError(value) || getMaxLengthError(value, fieldMaxLengths.rent);
    case "beds":
      return getNumericError(value, false) || getMaxLengthError(value, fieldMaxLengths.beds);
    case "baths":
      return getNumericError(value) || getMaxLengthError(value, fieldMaxLengths.baths);
    case "neighborhood":
      return getMaxLengthError(value, fieldMaxLengths.neighborhood);
    case "listingUrl":
      return getMaxLengthError(value, fieldMaxLengths.listingUrl);
    case "pros":
      return getMaxLengthError(value, fieldMaxLengths.pros);
    case "cons":
      return getMaxLengthError(value, fieldMaxLengths.cons);
    case "agentNotes":
      return getMaxLengthError(value, fieldMaxLengths.agentNotes);
    case "source":
    default:
      return "";
  }
}

function buildErrors(values: AddPropertyValues) {
  return propertyFieldNames.reduce<FieldErrors>((errors, fieldName) => {
    const error = getFieldError(fieldName, values[fieldName]);

    if (error) {
      errors[fieldName] = error;
    }

    return errors;
  }, {});
}

function canSubmitProperty(values: AddPropertyValues, errors: FieldErrors) {
  return Boolean(values.listingTitle.trim() && values.address.trim() && Object.keys(errors).length === 0);
}

function makeFieldId(baseId: string, fieldName: AddPropertyField) {
  return `${baseId}-${fieldName}`;
}

export function AddPropertyForm({
  action,
  leadId,
  dirtyScope,
  isPreviewReadonly = false
}: {
  action: (formData: FormData) => void | Promise<void>;
  leadId: string;
  dirtyScope: string;
  isPreviewReadonly?: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const isSubmittingRef = useRef(false);
  const baseId = useId();
  const [isDirty, setIsDirty] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [touchedFields, setTouchedFields] = useState<TouchedFields>({});
  const [errors, setErrors] = useState<FieldErrors>({});

  function refreshFormState() {
    const form = formRef.current;

    if (!form) {
      return { values: null, nextErrors: {} };
    }

    const values = readFormValues(form);
    const nextErrors = buildErrors(values);

    setIsDirty(hasEnteredPropertyData(values));
    setErrors(nextErrors);
    setIsValid(canSubmitProperty(values, nextErrors));

    return { values, nextErrors };
  }

  function markTouched(fieldName: AddPropertyField) {
    setTouchedFields((current) => ({ ...current, [fieldName]: true }));
    refreshFormState();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    setHasAttemptedSubmit(true);
    const { values, nextErrors } = refreshFormState();

    if (!values || !canSubmitProperty(values, nextErrors)) {
      event.preventDefault();
      emitAppToast({ toastKey: "validation-error" });
      return;
    }

    isSubmittingRef.current = true;
  }

  function getVisibleError(fieldName: AddPropertyField) {
    if (fieldName === "listingTitle" || fieldName === "address" || hasAttemptedSubmit || touchedFields[fieldName]) {
      return errors[fieldName];
    }

    return undefined;
  }

  useEffect(() => {
    emitPropertyFormDirtyChange(dirtyScope, isDirty);
  }, [dirtyScope, isDirty]);

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (!isDirty || isSubmittingRef.current) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      emitPropertyFormDirtyChange(dirtyScope, false);
    };
  }, [dirtyScope, isDirty]);

  return (
    <form
      ref={formRef}
      action={action}
      noValidate
      onInput={refreshFormState}
      onChange={refreshFormState}
      onSubmit={handleSubmit}
      className="grid gap-5"
    >
      <input type="hidden" name="leadId" value={leadId} />
      <input type="hidden" name="status" value="interested" />
      <input type="hidden" name="rating" value="3" />
      <input type="hidden" name="clientFeedback" value="" />

      <div className="rounded-3xl border border-line/80 bg-white/85 p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="app-kicker">Required Basics</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Add the two details needed to save the property. Optional fields can stay blank.
            </p>
          </div>
          <div className="app-chip">Required</div>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <TextInput
            id={makeFieldId(baseId, "listingTitle")}
            label="Listing title / nickname"
            name="listingTitle"
            required
            maxLength={fieldMaxLengths.listingTitle}
            helpText="Required."
            error={getVisibleError("listingTitle")}
            onBlur={markTouched}
          />
          <TextInput
            id={makeFieldId(baseId, "address")}
            label="Address"
            name="address"
            required
            maxLength={fieldMaxLengths.address}
            helpText="Required."
            error={getVisibleError("address")}
            onBlur={markTouched}
          />
        </div>
      </div>

      <div className="rounded-3xl border border-line/80 bg-slate-50/80 p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="app-kicker">Optional Listing Details</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Price, layout, neighborhood, source, and listing URL can be added when available.
            </p>
          </div>
          <div className="app-chip">Optional</div>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <TextInput
            id={makeFieldId(baseId, "rent")}
            label="Price"
            name="rent"
            inputMode="decimal"
            maxLength={fieldMaxLengths.rent}
            helpText="Numbers only, like 2640 or 2640.50."
            error={getVisibleError("rent")}
            onBlur={markTouched}
          />
          <TextInput
            id={makeFieldId(baseId, "beds")}
            label="Beds"
            name="beds"
            inputMode="numeric"
            maxLength={fieldMaxLengths.beds}
            helpText="Whole numbers only."
            error={getVisibleError("beds")}
            onBlur={markTouched}
          />
          <TextInput
            id={makeFieldId(baseId, "baths")}
            label="Baths"
            name="baths"
            inputMode="decimal"
            maxLength={fieldMaxLengths.baths}
            helpText="Numbers only, like 1 or 1.5."
            error={getVisibleError("baths")}
            onBlur={markTouched}
          />
          <TextInput
            id={makeFieldId(baseId, "neighborhood")}
            label="Neighborhood"
            name="neighborhood"
            maxLength={fieldMaxLengths.neighborhood}
            error={getVisibleError("neighborhood")}
            onBlur={markTouched}
          />
          <TextInput
            id={makeFieldId(baseId, "listingUrl")}
            label="Listing URL"
            name="listingUrl"
            type="url"
            maxLength={fieldMaxLengths.listingUrl}
            error={getVisibleError("listingUrl")}
            onBlur={markTouched}
          />
          <SelectInput
            id={makeFieldId(baseId, "source")}
            label="Source"
            name="source"
            error={getVisibleError("source")}
            onBlur={markTouched}
          />
        </div>
      </div>

      <div className="rounded-3xl border border-line/80 bg-white/85 p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="app-kicker">Optional Notes</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Capture comparison details without affecting the required save flow.
            </p>
          </div>
          <div className="app-chip">Optional</div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <TextAreaInput
            id={makeFieldId(baseId, "pros")}
            label="Pros"
            name="pros"
            rows={5}
            maxLength={fieldMaxLengths.pros}
            error={getVisibleError("pros")}
            onBlur={markTouched}
          />
          <TextAreaInput
            id={makeFieldId(baseId, "cons")}
            label="Cons"
            name="cons"
            rows={5}
            maxLength={fieldMaxLengths.cons}
            error={getVisibleError("cons")}
            onBlur={markTouched}
          />
          <TextAreaInput
            id={makeFieldId(baseId, "agentNotes")}
            label="Agent notes"
            name="agentNotes"
            rows={5}
            maxLength={fieldMaxLengths.agentNotes}
            error={getVisibleError("agentNotes")}
            onBlur={markTouched}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <TooltipShell
          disabled={isPreviewReadonly}
          message="This preview workspace is read-only. Use a live workspace to save property changes."
        >
          <SubmitButton disabled={isPreviewReadonly || !isValid} />
        </TooltipShell>
      </div>
    </form>
  );
}

function TextInput({
  id,
  label,
  name,
  type = "text",
  required = false,
  inputMode,
  maxLength,
  helpText = "Optional.",
  error,
  onBlur
}: {
  id: string;
  label: string;
  name: AddPropertyField;
  type?: string;
  required?: boolean;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
  helpText?: string;
  error?: string;
  onBlur: (fieldName: AddPropertyField) => void;
}) {
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        inputMode={inputMode}
        maxLength={maxLength}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${helpId} ${errorId}` : helpId}
        onBlur={() => onBlur(name)}
        className={`app-input ${error ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100" : ""}`}
      />
      <p id={helpId} className="text-xs text-slate-500">
        {helpText}
      </p>
      <FieldError id={errorId} message={error} />
    </div>
  );
}

function SelectInput({
  id,
  label,
  name,
  error,
  onBlur
}: {
  id: string;
  label: string;
  name: AddPropertyField;
  error?: string;
  onBlur: (fieldName: AddPropertyField) => void;
}) {
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <select
        id={id}
        name={name}
        defaultValue=""
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${helpId} ${errorId}` : helpId}
        onBlur={() => onBlur(name)}
        className={`app-input ${error ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100" : ""}`}
      >
        <option value="">Not selected</option>
        {leadSourceOptions.map((source) => (
          <option key={source} value={source}>
            {getPropertyInterestSourceLabel(source)}
          </option>
        ))}
      </select>
      <p id={helpId} className="text-xs text-slate-500">
        Optional.
      </p>
      <FieldError id={errorId} message={error} />
    </div>
  );
}

function TextAreaInput({
  id,
  label,
  name,
  rows,
  maxLength,
  error,
  onBlur
}: {
  id: string;
  label: string;
  name: AddPropertyField;
  rows: number;
  maxLength: number;
  error?: string;
  onBlur: (fieldName: AddPropertyField) => void;
}) {
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <textarea
        id={id}
        name={name}
        rows={rows}
        maxLength={maxLength}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${helpId} ${errorId}` : helpId}
        onBlur={() => onBlur(name)}
        className={`app-textarea resize-y ${error ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100" : ""}`}
      />
      <p id={helpId} className="text-xs text-slate-500">
        Optional.
      </p>
      <FieldError id={errorId} message={error} />
    </div>
  );
}

function SubmitButton({ disabled = false }: { disabled?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={disabled || pending} className="app-button-primary disabled:cursor-not-allowed disabled:opacity-55">
      {pending ? (
        <>
          <InlineSpinner />
          <span>Saving Property...</span>
        </>
      ) : (
        "Add Property"
      )}
    </button>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return (
    <p id={id} className="min-h-[1.25rem] text-xs font-medium text-rose-600" aria-live="polite">
      {message || ""}
    </p>
  );
}
