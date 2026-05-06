"use client";

import { useId, useMemo, useState, type FormEvent, type InputHTMLAttributes } from "react";
import { useFormStatus } from "react-dom";
import { AddPropertyWorkflowPanel } from "@/components/add-property-workflow-panel";
import { InlineSpinner } from "@/components/inline-spinner";
import { TooltipShell } from "@/components/tooltip-shell";
import { createPropertyListing } from "@/lib/actions";
import { emitAppToast } from "@/lib/client-toast";
import { fieldMaxLengths, getMaxLengthError, getNumericError, sanitizeNumericInput } from "@/lib/form-validation";
import { getSourceLabel, leadSourceOptions } from "@/lib/lead-utils";
import { getPropertyListingStatusLabel, propertyListingStatusOptions } from "@/lib/property-listing-utils";
import type { PropertyWorkflowDraft } from "@/lib/property-workflow";
import type { PropertyListing } from "@/lib/types";

type ListingField =
  | "title"
  | "address"
  | "price"
  | "beds"
  | "baths"
  | "neighborhood"
  | "source"
  | "listingUrl"
  | "status"
  | "notes";

type ListingValues = Record<ListingField, string>;
type ListingErrors = Partial<Record<ListingField, string>>;
type TouchedFields = Partial<Record<ListingField, boolean>>;

const listingFieldNames: ListingField[] = [
  "title",
  "address",
  "price",
  "beds",
  "baths",
  "neighborhood",
  "source",
  "listingUrl",
  "status",
  "notes"
];

function getInitialValues(): ListingValues {
  return {
    title: "",
    address: "",
    price: "",
    beds: "",
    baths: "",
    neighborhood: "",
    source: "Zillow",
    listingUrl: "",
    status: "available",
    notes: ""
  };
}

function getFieldError(fieldName: ListingField, value: string) {
  switch (fieldName) {
    case "title":
      return (!value.trim() ? "Title is required." : "") || getMaxLengthError(value, fieldMaxLengths.listingTitle);
    case "address":
      return (!value.trim() ? "Address is required." : "") || getMaxLengthError(value, fieldMaxLengths.address);
    case "price":
      return getNumericError(value) || getMaxLengthError(value, fieldMaxLengths.rent);
    case "beds":
      return getNumericError(value, false) || getMaxLengthError(value, fieldMaxLengths.beds);
    case "baths":
      return getNumericError(value) || getMaxLengthError(value, fieldMaxLengths.baths);
    case "neighborhood":
      return getMaxLengthError(value, fieldMaxLengths.neighborhood);
    case "listingUrl":
      return getMaxLengthError(value, fieldMaxLengths.listingUrl);
    case "notes":
      return getMaxLengthError(value, fieldMaxLengths.notes);
    case "source":
    case "status":
    default:
      return "";
  }
}

function buildErrors(values: ListingValues) {
  return listingFieldNames.reduce<ListingErrors>((errors, fieldName) => {
    const error = getFieldError(fieldName, values[fieldName]);

    if (error) {
      errors[fieldName] = error;
    }

    return errors;
  }, {});
}

function canSubmitListing(values: ListingValues, errors: ListingErrors) {
  return Boolean(values.title.trim() && values.address.trim() && Object.keys(errors).length === 0);
}

function makeFieldId(baseId: string, fieldName: ListingField) {
  return `${baseId}-${fieldName}`;
}

export function PropertyListingCreateForm({
  propertyListings,
  isPreviewReadonly = false
}: {
  propertyListings: PropertyListing[];
  isPreviewReadonly?: boolean;
}) {
  const baseId = useId();
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [touchedFields, setTouchedFields] = useState<TouchedFields>({});
  const [values, setValues] = useState<ListingValues>(() => getInitialValues());
  const errors = useMemo(() => buildErrors(values), [values]);

  function updateField(fieldName: ListingField, value: string) {
    const nextValue =
      fieldName === "price"
        ? sanitizeNumericInput(value)
        : fieldName === "beds"
          ? sanitizeNumericInput(value, false)
          : fieldName === "baths"
            ? sanitizeNumericInput(value)
            : value;

    setValues((current) => ({ ...current, [fieldName]: nextValue }));
  }

  function markTouched(fieldName: ListingField) {
    setTouchedFields((current) => ({ ...current, [fieldName]: true }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    setHasAttemptedSubmit(true);

    if (!canSubmitListing(values, errors)) {
      event.preventDefault();
      emitAppToast({ toastKey: "validation-error" });
    }
  }

  function applyWorkflowDraft(draft: PropertyWorkflowDraft) {
    setValues((current) => {
      const next = { ...current };

      if (draft.listingTitle !== undefined) {
        next.title = draft.listingTitle;
      }

      if (draft.address !== undefined) {
        next.address = draft.address;

        if (!draft.listingTitle && !next.title.trim()) {
          next.title = draft.address;
        }
      }

      if (draft.rent !== undefined) {
        next.price = sanitizeNumericInput(draft.rent);
      }

      if (draft.beds !== undefined) {
        next.beds = sanitizeNumericInput(draft.beds, false);
      }

      if (draft.baths !== undefined) {
        next.baths = sanitizeNumericInput(draft.baths);
      }

      if (draft.neighborhood !== undefined) {
        next.neighborhood = draft.neighborhood;
      }

      if (draft.source !== undefined) {
        next.source = draft.source;
      }

      if (draft.listingUrl !== undefined) {
        next.listingUrl = draft.listingUrl;
      }

      if (draft.agentNotes !== undefined) {
        next.notes = draft.agentNotes;
      }

      return next;
    });
    emitAppToast({ message: "Property listing details filled" });
  }

  function getVisibleError(fieldName: ListingField) {
    if (fieldName === "title" || fieldName === "address" || hasAttemptedSubmit || touchedFields[fieldName]) {
      return errors[fieldName];
    }

    return undefined;
  }

  return (
    <section id="add-property-listing" className="app-panel p-5 sm:p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="app-eyebrow">Add Property</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink">
            Add property listing
          </h2>
          <p className="app-copy mt-2 max-w-3xl">
            Search saved inventory, start with an address, or paste a portal link. Manual fields stay editable before saving.
          </p>
        </div>
        <div className="app-chip">Visible workflow</div>
      </div>

      <form action={createPropertyListing} noValidate onSubmit={handleSubmit} className="mt-5 grid gap-5">
        <AddPropertyWorkflowPanel propertyListings={propertyListings} onApply={applyWorkflowDraft} />

        <div className="rounded-3xl border border-line/80 bg-white/85 p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="app-kicker">Required Basics</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Title and address are required. Everything else can be added when available.
              </p>
            </div>
            <div className="app-chip">Required</div>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <TextInput
              id={makeFieldId(baseId, "title")}
              label="Listing title / nickname"
              name="title"
              value={values.title}
              required
              maxLength={fieldMaxLengths.listingTitle}
              helpText="Required."
              error={getVisibleError("title")}
              onChange={updateField}
              onBlur={markTouched}
            />
            <TextInput
              id={makeFieldId(baseId, "address")}
              label="Address"
              name="address"
              value={values.address}
              required
              maxLength={fieldMaxLengths.address}
              helpText="Required."
              error={getVisibleError("address")}
              onChange={updateField}
              onBlur={markTouched}
            />
          </div>
        </div>

        <div className="rounded-3xl border border-line/80 bg-slate-50/80 p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="app-kicker">Optional Listing Details</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Price, layout, neighborhood, source, status, and listing URL can stay blank or defaulted.
              </p>
            </div>
            <div className="app-chip">Optional</div>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <TextInput
              id={makeFieldId(baseId, "price")}
              label="Price"
              name="price"
              value={values.price}
              inputMode="decimal"
              maxLength={fieldMaxLengths.rent}
              helpText="Numbers only, like 2640 or 2640.50."
              error={getVisibleError("price")}
              onChange={updateField}
              onBlur={markTouched}
            />
            <TextInput
              id={makeFieldId(baseId, "beds")}
              label="Beds"
              name="beds"
              value={values.beds}
              inputMode="numeric"
              maxLength={fieldMaxLengths.beds}
              helpText="Whole numbers only."
              error={getVisibleError("beds")}
              onChange={updateField}
              onBlur={markTouched}
            />
            <TextInput
              id={makeFieldId(baseId, "baths")}
              label="Baths"
              name="baths"
              value={values.baths}
              inputMode="decimal"
              maxLength={fieldMaxLengths.baths}
              helpText="Numbers only, like 1 or 1.5."
              error={getVisibleError("baths")}
              onChange={updateField}
              onBlur={markTouched}
            />
            <TextInput
              id={makeFieldId(baseId, "neighborhood")}
              label="Neighborhood"
              name="neighborhood"
              value={values.neighborhood}
              maxLength={fieldMaxLengths.neighborhood}
              error={getVisibleError("neighborhood")}
              onChange={updateField}
              onBlur={markTouched}
            />
            <TextInput
              id={makeFieldId(baseId, "listingUrl")}
              label="Listing URL"
              name="listingUrl"
              value={values.listingUrl}
              type="url"
              maxLength={fieldMaxLengths.listingUrl}
              error={getVisibleError("listingUrl")}
              onChange={updateField}
              onBlur={markTouched}
            />
            <SourceSelect
              id={makeFieldId(baseId, "source")}
              label="Source"
              name="source"
              value={values.source}
              error={getVisibleError("source")}
              onChange={updateField}
              onBlur={markTouched}
            />
            <StatusSelect
              id={makeFieldId(baseId, "status")}
              label="Status"
              name="status"
              value={values.status}
              error={getVisibleError("status")}
              onChange={updateField}
              onBlur={markTouched}
            />
          </div>
        </div>

        <TextAreaInput
          id={makeFieldId(baseId, "notes")}
          label="Notes"
          name="notes"
          value={values.notes}
          rows={4}
          maxLength={fieldMaxLengths.notes}
          error={getVisibleError("notes")}
          onChange={updateField}
          onBlur={markTouched}
        />

        <div className="flex justify-end">
          <TooltipShell
            disabled={isPreviewReadonly}
            message="This preview workspace is read-only. Use a live workspace to save property listings."
          >
            <SubmitButton disabled={isPreviewReadonly || !canSubmitListing(values, errors)} />
          </TooltipShell>
        </div>
      </form>
    </section>
  );
}

function TextInput({
  id,
  label,
  name,
  value,
  type = "text",
  required = false,
  inputMode,
  maxLength,
  helpText = "Optional.",
  error,
  onChange,
  onBlur
}: {
  id: string;
  label: string;
  name: ListingField;
  value: string;
  type?: string;
  required?: boolean;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
  helpText?: string;
  error?: string;
  onChange: (fieldName: ListingField, value: string) => void;
  onBlur: (fieldName: ListingField) => void;
}) {
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
        {required ? <span className="text-rose-600"> *</span> : null}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        required={required}
        inputMode={inputMode}
        maxLength={maxLength}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${helpId} ${errorId}` : helpId}
        onChange={(event) => onChange(name, event.target.value)}
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

function SourceSelect({
  id,
  label,
  name,
  value,
  error,
  onChange,
  onBlur
}: {
  id: string;
  label: string;
  name: ListingField;
  value: string;
  error?: string;
  onChange: (fieldName: ListingField, value: string) => void;
  onBlur: (fieldName: ListingField) => void;
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
        value={value}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${helpId} ${errorId}` : helpId}
        onChange={(event) => onChange(name, event.target.value)}
        onBlur={() => onBlur(name)}
        className={`app-input bg-white text-ink ${error ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100" : ""}`}
      >
        {leadSourceOptions.map((source) => (
          <option key={source} value={source}>
            {getSourceLabel(source)}
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

function StatusSelect({
  id,
  label,
  name,
  value,
  error,
  onChange,
  onBlur
}: {
  id: string;
  label: string;
  name: ListingField;
  value: string;
  error?: string;
  onChange: (fieldName: ListingField, value: string) => void;
  onBlur: (fieldName: ListingField) => void;
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
        value={value}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${helpId} ${errorId}` : helpId}
        onChange={(event) => onChange(name, event.target.value)}
        onBlur={() => onBlur(name)}
        className={`app-input bg-white text-ink ${error ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100" : ""}`}
      >
        {propertyListingStatusOptions.map((status) => (
          <option key={status} value={status}>
            {getPropertyListingStatusLabel(status)}
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
  value,
  rows,
  maxLength,
  error,
  onChange,
  onBlur
}: {
  id: string;
  label: string;
  name: ListingField;
  value: string;
  rows: number;
  maxLength: number;
  error?: string;
  onChange: (fieldName: ListingField, value: string) => void;
  onBlur: (fieldName: ListingField) => void;
}) {
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;

  return (
    <div className="rounded-3xl border border-line/80 bg-white/85 p-5">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <textarea
        id={id}
        name={name}
        rows={rows}
        value={value}
        maxLength={maxLength}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${helpId} ${errorId}` : helpId}
        onChange={(event) => onChange(name, event.target.value)}
        onBlur={() => onBlur(name)}
        className={`app-textarea mt-2 resize-y ${error ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100" : ""}`}
      />
      <p id={helpId} className="mt-2 text-xs text-slate-500">
        Optional.
      </p>
      <FieldError id={errorId} message={error} />
    </div>
  );
}

function SubmitButton({ disabled = false }: { disabled?: boolean }) {
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
          <span>Saving Listing...</span>
        </>
      ) : (
        "Save Listing"
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
