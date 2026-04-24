"use client";

import { useMemo, useRef, useState, type InputHTMLAttributes } from "react";
import { useFormStatus } from "react-dom";
import { AutoResizeTextarea } from "@/components/auto-resize-textarea";
import { DateTimePickerFields, DateTimePickerHandle } from "@/components/date-time-picker-fields";
import { InlineSpinner } from "@/components/inline-spinner";
import { TooltipShell } from "@/components/tooltip-shell";
import { emitAppToast } from "@/lib/client-toast";
import {
  fieldMaxLengths,
  getMaxLengthError,
  getNumericError,
  getRequiredSelectError,
  sanitizeNumericInput
} from "@/lib/form-validation";
import { leadSourceOptions } from "@/lib/lead-utils";
import {
  getPropertyInterestSourceLabel,
  getPropertyInterestStatusLabel,
  propertyInterestStatusOptions
} from "@/lib/property-interest-utils";
import { PropertyInterest } from "@/lib/types";

type FieldErrors = Partial<Record<string, string>>;
type TouchedFields = Partial<Record<keyof PropertyFormValues, boolean>>;

type PropertyFormValues = {
  listingTitle: string;
  address: string;
  source: string;
  listingUrl: string;
  rent: string;
  neighborhood: string;
  beds: string;
  baths: string;
  status: string;
  rating: string;
  clientFeedback: string;
  pros: string;
  cons: string;
  agentNotes: string;
};

const fieldOrder = [
  "listingTitle",
  "address",
  "source",
  "listingUrl",
  "rent",
  "neighborhood",
  "beds",
  "baths",
  "status",
  "rating",
  "clientFeedback",
  "pros",
  "cons",
  "agentNotes"
];
const alwaysVisibleErrorFields: Array<keyof PropertyFormValues> = ["listingTitle", "address"];

function getFieldError(name: keyof PropertyFormValues, value: string) {
  switch (name) {
    case "listingTitle":
      return (
        (!value.trim() ? "Listing title is required." : "") ||
        getMaxLengthError(value, fieldMaxLengths.listingTitle)
      );
    case "address":
      return (
        (!value.trim() ? "Address is required." : "") ||
        getMaxLengthError(value, fieldMaxLengths.address)
      );
    case "source":
    case "status":
      return getRequiredSelectError(value);
    case "listingUrl":
      return getMaxLengthError(value, fieldMaxLengths.listingUrl);
    case "rent":
      return (getNumericError(value) ? "Price must be numeric." : "") || getMaxLengthError(value, fieldMaxLengths.rent);
    case "beds":
      return (getNumericError(value, false) ? "Beds must be numeric." : "") || getMaxLengthError(value, fieldMaxLengths.beds);
    case "baths":
      return (getNumericError(value) ? "Baths must be numeric." : "") || getMaxLengthError(value, fieldMaxLengths.baths);
    case "neighborhood":
      return getMaxLengthError(value, fieldMaxLengths.neighborhood);
    case "rating":
      return getRequiredSelectError(value);
    case "clientFeedback":
      return getMaxLengthError(value, fieldMaxLengths.notes);
    case "pros":
      return getMaxLengthError(value, fieldMaxLengths.pros);
    case "cons":
      return getMaxLengthError(value, fieldMaxLengths.cons);
    case "agentNotes":
      return getMaxLengthError(value, fieldMaxLengths.agentNotes);
    default:
      return "";
  }
}

function buildErrors(values: PropertyFormValues) {
  return Object.entries(values).reduce<FieldErrors>((current, [name, value]) => {
    const nextError = getFieldError(name as keyof PropertyFormValues, value);

    if (!nextError) {
      return current;
    }

    return { ...current, [name]: nextError };
  }, {});
}

export function PropertyInterestForm({
  action,
  leadId,
  propertyInterest,
  submitLabel,
  isPreviewReadonly = false
}: {
  action: (formData: FormData) => void | Promise<void>;
  leadId: string;
  propertyInterest?: PropertyInterest;
  submitLabel: string;
  isPreviewReadonly?: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const scheduleRef = useRef<DateTimePickerHandle>(null);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [touched, setTouched] = useState<TouchedFields>({});
  const [values, setValues] = useState<PropertyFormValues>({
    listingTitle: propertyInterest?.listingTitle || "",
    address: propertyInterest?.address || "",
    source: propertyInterest?.source || "other",
    listingUrl: propertyInterest?.listingUrl || "",
    rent: propertyInterest?.rent || "",
    neighborhood: propertyInterest?.neighborhood || "",
    beds: propertyInterest?.beds || "",
    baths: propertyInterest?.baths || "",
    status: propertyInterest?.status || "interested",
    rating: String(propertyInterest?.rating || 3),
    clientFeedback: propertyInterest?.clientFeedback || "",
    pros: propertyInterest?.pros || "",
    cons: propertyInterest?.cons || "",
    agentNotes: propertyInterest?.agentNotes || ""
  });
  const [scheduleState, setScheduleState] = useState({
    date: propertyInterest?.showingDate || "",
    time: propertyInterest?.showingTime || "",
    isValid: true,
    isPastDate: false
  });
  const liveErrors = useMemo(() => buildErrors(values), [values]);
  const visibleErrors = useMemo(
    () =>
      fieldOrder.reduce<FieldErrors>((current, name) => {
        if (
          (alwaysVisibleErrorFields.includes(name as keyof PropertyFormValues) ||
            hasAttemptedSubmit ||
            touched[name as keyof PropertyFormValues]) &&
          liveErrors[name]
        ) {
          return { ...current, [name]: liveErrors[name] };
        }

        return current;
      }, {}),
    [hasAttemptedSubmit, liveErrors, touched]
  );

  const isFormValid = useMemo(
    () =>
      Object.keys(liveErrors).length === 0 &&
      scheduleState.isValid &&
      !(values.status === "scheduled" && (!scheduleState.date || !scheduleState.time)),
    [liveErrors, scheduleState, values.status]
  );

  function updateField(name: keyof PropertyFormValues, value: string) {
    const nextValue =
      name === "rent"
        ? sanitizeNumericInput(value)
        : name === "beds"
          ? sanitizeNumericInput(value, false)
          : name === "baths"
            ? sanitizeNumericInput(value)
            : value;

    setValues((current) => ({ ...current, [name]: nextValue }));
  }

  function markFieldTouched(name: keyof PropertyFormValues) {
    setTouched((current) => ({ ...current, [name]: true }));
  }

  function validateForm() {
    setHasAttemptedSubmit(true);

    const isScheduleValid = scheduleRef.current?.validate() ?? true;

    if (values.status === "scheduled" && (!scheduleState.date || !scheduleState.time)) {
      emitAppToast({ message: "Add a showing date and time before saving a scheduled property." });
      scheduleRef.current?.focusDate();
      return false;
    }

    if (Object.keys(liveErrors).length === 0 && isScheduleValid) {
      return true;
    }

    emitAppToast({ toastKey: "validation-error" });

    for (const name of fieldOrder) {
      if (liveErrors[name]) {
        const field = formRef.current?.querySelector<HTMLElement>(`[data-field="${name}"]`);
        field?.focus();
        break;
      }
    }

    if (!isScheduleValid) {
      scheduleRef.current?.focusDate();
    }

    return false;
  }

  return (
    <form
      ref={formRef}
      action={action}
      noValidate
      onSubmit={(event) => {
        if (!validateForm()) {
          event.preventDefault();
        }
      }}
      className="grid gap-5"
    >
      <input type="hidden" name="leadId" value={leadId} />
      {propertyInterest ? <input type="hidden" name="propertyInterestId" value={propertyInterest.id} /> : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Listing title or nickname"
          name="listingTitle"
          value={values.listingTitle}
          required
          maxLength={fieldMaxLengths.listingTitle}
          helpText="Required. Give the property a clear name your team can recognize quickly."
          error={visibleErrors.listingTitle}
          onChange={updateField}
          onBlur={markFieldTouched}
        />
        <Field
          label="Address"
          name="address"
          value={values.address}
          required
          maxLength={fieldMaxLengths.address}
          helpText="Required. Use the full street address for maps, routes, and reporting."
          error={visibleErrors.address}
          onChange={updateField}
          onBlur={markFieldTouched}
        />
        <SelectField
          label="Source"
          name="source"
          value={values.source}
          required
          error={visibleErrors.source}
          onChange={updateField}
          onBlur={markFieldTouched}
          options={leadSourceOptions.map((option) => ({
            value: option,
            label: getPropertyInterestSourceLabel(option)
          }))}
        />
        <Field
          label="Listing URL"
          name="listingUrl"
          value={values.listingUrl}
          type="url"
          maxLength={fieldMaxLengths.listingUrl}
          helpText="Optional. Paste the live listing link if you want one-click access later."
          error={visibleErrors.listingUrl}
          onChange={updateField}
          onBlur={markFieldTouched}
        />
        <Field
          label="Rent / price"
          name="rent"
          value={values.rent}
          placeholder="2640"
          inputMode="decimal"
          maxLength={fieldMaxLengths.rent}
          helpText="Optional. Numbers only, like 2640 or 2640.50."
          error={visibleErrors.rent}
          onChange={updateField}
          onBlur={markFieldTouched}
        />
        <Field
          label="Neighborhood"
          name="neighborhood"
          value={values.neighborhood}
          maxLength={fieldMaxLengths.neighborhood}
          error={visibleErrors.neighborhood}
          onChange={updateField}
          onBlur={markFieldTouched}
        />
        <Field
          label="Beds"
          name="beds"
          value={values.beds}
          placeholder="2"
          inputMode="numeric"
          maxLength={fieldMaxLengths.beds}
          helpText="Optional. Whole numbers only."
          error={visibleErrors.beds}
          onChange={updateField}
          onBlur={markFieldTouched}
        />
        <Field
          label="Baths"
          name="baths"
          value={values.baths}
          placeholder="2"
          inputMode="decimal"
          maxLength={fieldMaxLengths.baths}
          helpText="Optional. Numbers only, like 1 or 1.5."
          error={visibleErrors.baths}
          onChange={updateField}
          onBlur={markFieldTouched}
        />
        <SelectField
          label="Status"
          name="status"
          value={values.status}
          required
          error={visibleErrors.status}
          onChange={updateField}
          onBlur={markFieldTouched}
          options={propertyInterestStatusOptions.map((option) => ({
            value: option,
            label: getPropertyInterestStatusLabel(option)
          }))}
        />
        <SelectField
          label="Client rating"
          name="rating"
          value={values.rating}
          onChange={updateField}
          onBlur={markFieldTouched}
          options={[1, 2, 3, 4, 5].map((rating) => ({
            value: String(rating),
            label: `${rating} / 5`
          }))}
        />
      </div>

      <div className="app-subpanel p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-ink">Property showing schedule</p>
            <p className="mt-1 text-sm text-slate-600">
              Set a property-specific showing if this listing is moving into a real tour workflow.
            </p>
          </div>
          <div className="app-chip">Optional</div>
        </div>

        <div className="mt-5">
          <DateTimePickerFields
            ref={scheduleRef}
            dateName="showingDate"
            timeName="showingTime"
            allowPastDateOverrideName="showingDateAllowPastOverride"
            dateLabel="Property showing date"
            timeLabel="Property showing time"
            dateAriaLabel="property showing date"
            timeAriaLabel="property showing time"
            initialDate={propertyInterest?.showingDate || ""}
            initialTime={propertyInterest?.showingTime || ""}
            onValueChange={setScheduleState}
          />
          {values.status === "scheduled" && (!scheduleState.date || !scheduleState.time) ? (
            <p className="mt-3 text-xs font-medium text-amber-700">
              Scheduled properties need both a showing date and showing time.
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <TextAreaField
          label="Client feedback"
          name="clientFeedback"
          rows={5}
          value={values.clientFeedback}
          maxLength={fieldMaxLengths.notes}
          error={visibleErrors.clientFeedback}
          placeholder="What did the customer say after seeing or reviewing this listing?"
          onChange={updateField}
          onBlur={markFieldTouched}
        />
        <TextAreaField
          label="Agent feedback"
          name="agentNotes"
          rows={5}
          value={values.agentNotes}
          maxLength={fieldMaxLengths.agentNotes}
          error={visibleErrors.agentNotes}
          placeholder="Tour notes, access instructions, follow-up points, and context."
          onChange={updateField}
          onBlur={markFieldTouched}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <TextAreaField
          label="Pros"
          name="pros"
          rows={5}
          value={values.pros}
          maxLength={fieldMaxLengths.pros}
          error={visibleErrors.pros}
          placeholder="What does the customer like about this property?"
          onChange={updateField}
          onBlur={markFieldTouched}
        />
        <TextAreaField
          label="Cons"
          name="cons"
          rows={5}
          value={values.cons}
          maxLength={fieldMaxLengths.cons}
          error={visibleErrors.cons}
          placeholder="Any drawbacks, objections, or deal-breakers."
          onChange={updateField}
          onBlur={markFieldTouched}
        />
        <div className="rounded-3xl border border-line/70 bg-slate-50/90 px-4 py-4">
          <p className="app-kicker">Workflow Tip</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Use the property schedule plus client feedback to decide which homes move to touring,
            applying, or approval.
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <TooltipShell
          disabled={isPreviewReadonly}
          message="Preview mode is read-only. Disable preview mode or use a live database to save property changes."
        >
          <SubmitButton disabled={isPreviewReadonly || !isFormValid} submitLabel={submitLabel} />
        </TooltipShell>
      </div>
    </form>
  );
}

function SubmitButton({
  disabled = false,
  submitLabel
}: {
  disabled?: boolean;
  submitLabel: string;
}) {
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
          <span>Saving Property...</span>
        </>
      ) : (
        submitLabel
      )}
    </button>
  );
}

function Field({
  label,
  name,
  value,
  type = "text",
  placeholder,
  required = false,
  helpText,
  inputMode,
  maxLength,
  error,
  onChange,
  onBlur
}: {
  label: string;
  name: keyof PropertyFormValues;
  value: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
  error?: string;
  onChange: (name: keyof PropertyFormValues, value: string) => void;
  onBlur: (name: keyof PropertyFormValues) => void;
}) {
  const helpId = `${name}-help`;
  const errorId = `${name}-error`;

  return (
    <label className="flex min-w-0 flex-col gap-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        inputMode={inputMode}
        maxLength={maxLength}
        placeholder={placeholder}
        required={required}
        data-field={name}
        aria-label={label}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${helpId} ${errorId}` : helpId}
        onChange={(event) => onChange(name, event.target.value)}
        onBlur={() => onBlur(name)}
        className={`app-input ${error ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100" : ""}`}
      />
      <p id={helpId} className="text-xs text-slate-500">
        {helpText || (required ? "Required field." : "Optional field.")}
      </p>
      <FieldError id={errorId} message={error} />
    </label>
  );
}

function SelectField({
  label,
  name,
  value,
  options,
  required = false,
  error,
  onChange,
  onBlur
}: {
  label: string;
  name: keyof PropertyFormValues;
  value: string;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
  error?: string;
  onChange: (name: keyof PropertyFormValues, value: string) => void;
  onBlur: (name: keyof PropertyFormValues) => void;
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
        onBlur={() => onBlur(name)}
        className={`app-input ${error ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100" : ""}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <p id={helpId} className="text-xs text-slate-500">
        {required ? "Required field." : "Optional field."}
      </p>
      <FieldError id={errorId} message={error} />
    </label>
  );
}

function TextAreaField({
  label,
  name,
  rows,
  value,
  placeholder,
  maxLength,
  error,
  onChange,
  onBlur
}: {
  label: string;
  name: keyof PropertyFormValues;
  rows: number;
  value: string;
  placeholder?: string;
  maxLength: number;
  error?: string;
  onChange: (name: keyof PropertyFormValues, value: string) => void;
  onBlur: (name: keyof PropertyFormValues) => void;
}) {
  const helpId = `${name}-help`;
  const errorId = `${name}-error`;

  return (
    <label className="flex min-w-0 flex-col gap-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <AutoResizeTextarea
        name={name}
        rows={rows}
        value={value}
        maxLength={maxLength}
        data-field={name}
        placeholder={placeholder}
        aria-label={label}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${helpId} ${errorId}` : helpId}
        onChange={(event) => onChange(name, event.target.value)}
        onBlur={() => onBlur(name)}
        className={`app-textarea ${error ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100" : ""}`}
      />
      <p id={helpId} className="text-xs text-slate-500">
        Optional field.
      </p>
      <FieldError id={errorId} message={error} />
    </label>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return (
    <p id={id} className="min-h-[1.25rem] text-xs font-medium text-rose-600" aria-live="polite">
      {message || ""}
    </p>
  );
}
