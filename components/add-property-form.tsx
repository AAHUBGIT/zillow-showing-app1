"use client";

import { useEffect, useId, useMemo, useRef, useState, type FormEvent, type InputHTMLAttributes } from "react";
import { useFormStatus } from "react-dom";
import { AddPropertyWorkflowPanel } from "@/components/add-property-workflow-panel";
import { InlineSpinner } from "@/components/inline-spinner";
import { emitPropertyFormDirtyChange } from "@/components/property-form-dirty";
import { TooltipShell } from "@/components/tooltip-shell";
import { emitAppToast } from "@/lib/client-toast";
import { fieldMaxLengths, getMaxLengthError, getNumericError, sanitizeNumericInput } from "@/lib/form-validation";
import { leadSourceOptions } from "@/lib/lead-utils";
import { getPropertyInterestSourceLabel } from "@/lib/property-interest-utils";
import type { PropertyWorkflowDraft } from "@/lib/property-workflow";
import type { LeadWithProperties, PropertyListing } from "@/lib/types";

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

function getInitialValues(): AddPropertyValues {
  return {
    listingTitle: "",
    address: "",
    rent: "",
    beds: "",
    baths: "",
    neighborhood: "",
    source: "",
    listingUrl: "",
    pros: "",
    cons: "",
    agentNotes: ""
  };
}

export function AddPropertyForm({
  action,
  lead,
  propertyListings = [],
  leadId,
  dirtyScope,
  isPreviewReadonly = false
}: {
  action: (formData: FormData) => void | Promise<void>;
  lead?: LeadWithProperties;
  propertyListings?: PropertyListing[];
  leadId: string;
  dirtyScope: string;
  isPreviewReadonly?: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const dirtyRef = useRef(false);
  const isSubmittingRef = useRef(false);
  const baseId = useId();
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [touchedFields, setTouchedFields] = useState<TouchedFields>({});
  const [values, setValues] = useState<AddPropertyValues>(() => getInitialValues());
  const errors = useMemo(() => buildErrors(values), [values]);

  function setDirtyState(nextIsDirty: boolean) {
    if (dirtyRef.current !== nextIsDirty) {
      emitPropertyFormDirtyChange(dirtyScope, nextIsDirty);
    }

    dirtyRef.current = nextIsDirty;
  }

  function updateField(fieldName: AddPropertyField, value: string) {
    const nextValue =
      fieldName === "rent"
        ? sanitizeNumericInput(value)
        : fieldName === "beds"
          ? sanitizeNumericInput(value, false)
          : fieldName === "baths"
            ? sanitizeNumericInput(value)
            : value;

    setValues((current) => ({ ...current, [fieldName]: nextValue }));
  }

  function markTouched(fieldName: AddPropertyField) {
    setTouchedFields((current) => ({ ...current, [fieldName]: true }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    setHasAttemptedSubmit(true);

    if (!canSubmitProperty(values, errors)) {
      event.preventDefault();
      emitAppToast({ toastKey: "validation-error" });
      return;
    }

    isSubmittingRef.current = true;
  }

  function applyWorkflowDraft(draft: PropertyWorkflowDraft) {
    setValues((current) => {
      const next = { ...current };

      if (draft.listingTitle !== undefined) {
        next.listingTitle = draft.listingTitle;
      }

      if (draft.address !== undefined) {
        next.address = draft.address;

        if (!draft.listingTitle && !next.listingTitle.trim()) {
          next.listingTitle = draft.address;
        }
      }

      if (draft.rent !== undefined) {
        next.rent = sanitizeNumericInput(draft.rent);
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
        next.agentNotes = draft.agentNotes;
      }

      return next;
    });
    emitAppToast({ message: "Property details filled" });
  }

  function getVisibleError(fieldName: AddPropertyField) {
    if (fieldName === "listingTitle" || fieldName === "address" || hasAttemptedSubmit || touchedFields[fieldName]) {
      return errors[fieldName];
    }

    return undefined;
  }

  useEffect(() => {
    setDirtyState(hasEnteredPropertyData(values));
  }, [values]);

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (!dirtyRef.current || isSubmittingRef.current) {
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
  }, [dirtyScope]);

  return (
    <form
      ref={formRef}
      action={action}
      noValidate
      onSubmit={handleSubmit}
      className="grid gap-5"
    >
      <input type="hidden" name="leadId" value={leadId} />
      <input type="hidden" name="status" value="interested" />
      <input type="hidden" name="rating" value="3" />
      <input type="hidden" name="clientFeedback" value="" />

      <AddPropertyWorkflowPanel
        lead={lead}
        propertyListings={propertyListings}
        onApply={applyWorkflowDraft}
      />

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
            value={values.listingTitle}
            required
            maxLength={fieldMaxLengths.listingTitle}
            helpText="Required."
            error={getVisibleError("listingTitle")}
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
            value={values.rent}
            inputMode="decimal"
            maxLength={fieldMaxLengths.rent}
            helpText="Numbers only, like 2640 or 2640.50."
            error={getVisibleError("rent")}
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
          <SelectInput
            id={makeFieldId(baseId, "source")}
            label="Source"
            name="source"
            value={values.source}
            error={getVisibleError("source")}
            onChange={updateField}
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
            value={values.pros}
            rows={5}
            maxLength={fieldMaxLengths.pros}
            error={getVisibleError("pros")}
            onChange={updateField}
            onBlur={markTouched}
          />
          <TextAreaInput
            id={makeFieldId(baseId, "cons")}
            label="Cons"
            name="cons"
            value={values.cons}
            rows={5}
            maxLength={fieldMaxLengths.cons}
            error={getVisibleError("cons")}
            onChange={updateField}
            onBlur={markTouched}
          />
          <TextAreaInput
            id={makeFieldId(baseId, "agentNotes")}
            label="Agent notes"
            name="agentNotes"
            value={values.agentNotes}
            rows={5}
            maxLength={fieldMaxLengths.agentNotes}
            error={getVisibleError("agentNotes")}
            onChange={updateField}
            onBlur={markTouched}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <TooltipShell
          disabled={isPreviewReadonly}
          message="This preview workspace is read-only. Use a live workspace to save property changes."
        >
          <SubmitButton disabled={isPreviewReadonly} />
        </TooltipShell>
      </div>
    </form>
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
  name: AddPropertyField;
  value: string;
  type?: string;
  required?: boolean;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
  helpText?: string;
  error?: string;
  onChange: (fieldName: AddPropertyField, value: string) => void;
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

function SelectInput({
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
  name: AddPropertyField;
  value: string;
  error?: string;
  onChange: (fieldName: AddPropertyField, value: string) => void;
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
        value={value}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${helpId} ${errorId}` : helpId}
        onChange={(event) => onChange(name, event.target.value)}
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
  value,
  rows,
  maxLength,
  error,
  onChange,
  onBlur
}: {
  id: string;
  label: string;
  name: AddPropertyField;
  value: string;
  rows: number;
  maxLength: number;
  error?: string;
  onChange: (fieldName: AddPropertyField, value: string) => void;
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
        value={value}
        maxLength={maxLength}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${helpId} ${errorId}` : helpId}
        onChange={(event) => onChange(name, event.target.value)}
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
