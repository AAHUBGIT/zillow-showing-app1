"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { useFormStatus } from "react-dom";
import { InlineSpinner } from "@/components/inline-spinner";
import { createImportedLead } from "@/lib/actions";
import { emitAppToast } from "@/lib/client-toast";
import { fieldMaxLengths, getEmailError, getMaxLengthError, getPhoneError, getRequiredTextError } from "@/lib/form-validation";
import { getSourceLabel, leadSourceOptions } from "@/lib/lead-utils";
import { parseLeadInquiryText, type ParsedLeadImport } from "@/lib/lead-import-parser";
import { LeadSource } from "@/lib/types";

type ImportDuplicateLead = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  propertyAddress: string;
};

type ReviewValues = Omit<ParsedLeadImport, "confidenceNotes"> & {
  rawText: string;
};

type FieldErrors = Partial<Record<keyof ReviewValues, string>>;

const emptyParsedLead: ParsedLeadImport = {
  fullName: "",
  phone: "",
  email: "",
  propertyAddress: "",
  message: "",
  desiredMoveInDate: "",
  source: "Zillow",
  confidenceNotes: []
};

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

function buildReviewValues(parsedLead: ParsedLeadImport, rawText: string): ReviewValues {
  return {
    ...parsedLead,
    rawText
  };
}

function getReviewErrors(values: ReviewValues) {
  const errors: FieldErrors = {};

  const nameError = getRequiredTextError(values.fullName) || getMaxLengthError(values.fullName, fieldMaxLengths.fullName);
  if (nameError) {
    errors.fullName = nameError;
  }

  const phoneError = getPhoneError(values.phone) || getMaxLengthError(values.phone, fieldMaxLengths.phone);
  if (phoneError) {
    errors.phone = phoneError;
  }

  const emailError = getEmailError(values.email) || getMaxLengthError(values.email, fieldMaxLengths.email);
  if (emailError) {
    errors.email = emailError;
  }

  const addressError = getMaxLengthError(values.propertyAddress, fieldMaxLengths.propertyAddress);
  if (addressError) {
    errors.propertyAddress = addressError;
  }

  const notesError = getMaxLengthError(values.message, fieldMaxLengths.notes);
  if (notesError) {
    errors.message = notesError;
  }

  return errors;
}

export function LeadImportWorkflow({
  duplicateLeads,
  isPreviewReadonly = false
}: {
  duplicateLeads: ImportDuplicateLead[];
  isPreviewReadonly?: boolean;
}) {
  const [rawText, setRawText] = useState("");
  const [hasParsed, setHasParsed] = useState(false);
  const [parsedLead, setParsedLead] = useState<ParsedLeadImport>(emptyParsedLead);
  const [values, setValues] = useState<ReviewValues>(() => buildReviewValues(emptyParsedLead, ""));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [duplicateAcknowledged, setDuplicateAcknowledged] = useState(false);

  const possibleDuplicate = useMemo(() => {
    const email = normalizeEmail(values.email);
    const phone = normalizePhone(values.phone);

    return duplicateLeads.find((lead) => {
      const leadEmail = normalizeEmail(lead.email);
      const leadPhone = normalizePhone(lead.phone);

      return Boolean((email && email === leadEmail) || (phone && phone === leadPhone));
    });
  }, [duplicateLeads, values.email, values.phone]);
  const reviewErrors = useMemo(() => getReviewErrors(values), [values]);
  const canSave =
    hasParsed &&
    Object.keys(reviewErrors).length === 0 &&
    (!possibleDuplicate || duplicateAcknowledged) &&
    !isPreviewReadonly;

  function parsePastedText() {
    if (!rawText.trim()) {
      emitAppToast({ message: "Paste an inquiry before parsing." });
      return;
    }

    const nextParsedLead = parseLeadInquiryText(rawText);
    setParsedLead(nextParsedLead);
    setValues(buildReviewValues(nextParsedLead, rawText));
    setErrors({});
    setDuplicateAcknowledged(false);
    setHasParsed(true);
  }

  function updateValue(name: keyof ReviewValues, value: string) {
    setValues((current) => ({
      ...current,
      [name]: name === "source" ? (value as LeadSource) : value
    }));

    if (name === "email" || name === "phone") {
      setDuplicateAcknowledged(false);
    }
  }

  function validateBeforeSubmit(event: FormEvent<HTMLFormElement>) {
    const nextErrors = getReviewErrors(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0 || (possibleDuplicate && !duplicateAcknowledged)) {
      event.preventDefault();
      emitAppToast({ toastKey: "validation-error" });
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="app-panel p-5 sm:p-6">
        <p className="app-eyebrow">Paste Inquiry</p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink">Raw lead text</h2>
        <p className="app-copy mt-2">
          Paste the full email or portal message. The parser only reads the text you paste here.
        </p>

        <div className="mt-5">
          <label htmlFor="lead-import-raw-text" className="text-sm font-medium text-slate-700">
            Inquiry text
          </label>
          <textarea
            id="lead-import-raw-text"
            value={rawText}
            onChange={(event) => setRawText(event.target.value)}
            rows={14}
            className="app-textarea mt-2 min-h-[20rem]"
            placeholder={"Name: John Smith\nEmail: john@example.com\nPhone: 555-123-4567\nProperty: 123 Main St, Brooklyn, NY\nMessage: I'm interested in this apartment."}
          />
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-slate-500">
            Parsing is best-effort. Review every field before saving.
          </p>
          <button type="button" onClick={parsePastedText} className="app-button-primary">
            Parse
          </button>
        </div>
      </section>

      <section className="app-panel p-5 sm:p-6">
        <p className="app-eyebrow">Review Before Save</p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink">Parsed details</h2>
        <p className="app-copy mt-2">
          Edit anything the parser missed, then create the lead and first interested property.
        </p>

        {!hasParsed ? (
          <div className="mt-6 rounded-3xl border border-dashed border-line bg-slate-50/90 px-5 py-10 text-center">
            <p className="text-base font-semibold text-ink">No parsed inquiry yet</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Paste an inquiry and press Parse to review editable fields here.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-5 flex flex-wrap gap-2">
              {parsedLead.confidenceNotes.map((note) => (
                <span key={note} className="app-chip">
                  {note}
                </span>
              ))}
            </div>

            {possibleDuplicate ? (
              <div className="mt-5 rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4">
                <p className="text-sm font-semibold text-amber-800">Possible duplicate found</p>
                <p className="mt-2 text-sm leading-6 text-amber-800">
                  {possibleDuplicate.fullName} already matches this email or phone.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link href={`/leads/${possibleDuplicate.id}`} className="app-button-secondary bg-white">
                    Open existing lead
                  </Link>
                  <button
                    type="button"
                    onClick={() => setDuplicateAcknowledged(true)}
                    className="app-button-primary"
                  >
                    Create anyway
                  </button>
                </div>
              </div>
            ) : null}

            <form action={createImportedLead} noValidate onSubmit={validateBeforeSubmit} className="mt-6 grid gap-5 sm:grid-cols-2">
              <input type="hidden" name="rawText" value={values.rawText} />
              <ReviewField
                label="Full name"
                name="fullName"
                value={values.fullName}
                required
                maxLength={fieldMaxLengths.fullName}
                error={errors.fullName}
                onChange={updateValue}
              />
              <ReviewField
                label="Phone"
                name="phone"
                value={values.phone}
                type="tel"
                required
                maxLength={fieldMaxLengths.phone}
                error={errors.phone}
                onChange={updateValue}
              />
              <ReviewField
                label="Email"
                name="email"
                value={values.email}
                type="email"
                required
                maxLength={fieldMaxLengths.email}
                error={errors.email}
                onChange={updateValue}
              />
              <ReviewField
                label="Desired move-in date"
                name="desiredMoveInDate"
                value={values.desiredMoveInDate}
                type="date"
                error={errors.desiredMoveInDate}
                onChange={updateValue}
              />
              <ReviewField
                label="Property address"
                name="propertyAddress"
                value={values.propertyAddress}
                maxLength={fieldMaxLengths.propertyAddress}
                error={errors.propertyAddress}
                onChange={updateValue}
                className="sm:col-span-2"
              />
              <ReviewSelect
                label="Source"
                name="source"
                value={values.source}
                onChange={updateValue}
              />
              <div className="rounded-3xl border border-line/70 bg-slate-50/90 px-4 py-4">
                <p className="app-kicker">Save behavior</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  If an address is present, the import also creates the first interested property.
                </p>
              </div>
              <ReviewTextarea
                label="Message / notes"
                name="message"
                value={values.message}
                rows={5}
                maxLength={fieldMaxLengths.notes}
                error={errors.message}
                onChange={updateValue}
                className="sm:col-span-2"
              />

              <div className="sm:col-span-2 flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Ready to save</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Required fields: full name, phone, and email.
                  </p>
                </div>
                <ImportLeadButton disabled={!canSave} />
              </div>
            </form>
          </>
        )}
      </section>
    </div>
  );
}

function ReviewField({
  label,
  name,
  value,
  type = "text",
  required = false,
  maxLength,
  error,
  className = "",
  onChange
}: {
  label: string;
  name: keyof ReviewValues;
  value: string;
  type?: string;
  required?: boolean;
  maxLength?: number;
  error?: string;
  className?: string;
  onChange: (name: keyof ReviewValues, value: string) => void;
}) {
  const inputId = `import-${name}`;
  const helpId = `${inputId}-help`;
  const errorId = `${inputId}-error`;

  return (
    <div className={`flex min-w-0 flex-col gap-2 ${className}`}>
      <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        type={type}
        required={required}
        value={value}
        maxLength={maxLength}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${helpId} ${errorId}` : helpId}
        onChange={(event) => onChange(name, event.target.value)}
        className={`app-input ${error ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100" : ""}`}
      />
      <p id={helpId} className="text-xs text-slate-500">
        {required ? "Required field." : "Optional field."}
      </p>
      <FieldError id={errorId} message={error} />
    </div>
  );
}

function ReviewSelect({
  label,
  name,
  value,
  onChange
}: {
  label: string;
  name: keyof ReviewValues;
  value: LeadSource;
  onChange: (name: keyof ReviewValues, value: string) => void;
}) {
  const inputId = `import-${name}`;
  const helpId = `${inputId}-help`;

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <select
        id={inputId}
        name={name}
        value={value}
        aria-describedby={helpId}
        onChange={(event) => onChange(name, event.target.value)}
        className="app-input"
      >
        {leadSourceOptions.map((source) => (
          <option key={source} value={source}>
            {getSourceLabel(source)}
          </option>
        ))}
      </select>
      <p id={helpId} className="text-xs text-slate-500">
        Default is Zillow for imported portal inquiries.
      </p>
    </div>
  );
}

function ReviewTextarea({
  label,
  name,
  value,
  rows,
  maxLength,
  error,
  className = "",
  onChange
}: {
  label: string;
  name: keyof ReviewValues;
  value: string;
  rows: number;
  maxLength: number;
  error?: string;
  className?: string;
  onChange: (name: keyof ReviewValues, value: string) => void;
}) {
  const inputId = `import-${name}`;
  const helpId = `${inputId}-help`;
  const errorId = `${inputId}-error`;

  return (
    <div className={`flex min-w-0 flex-col gap-2 ${className}`}>
      <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <textarea
        id={inputId}
        name={name}
        rows={rows}
        value={value}
        maxLength={maxLength}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${helpId} ${errorId}` : helpId}
        onChange={(event) => onChange(name, event.target.value)}
        className={`app-textarea ${error ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100" : ""}`}
      />
      <p id={helpId} className="text-xs text-slate-500">
        Saved into lead notes.
      </p>
      <FieldError id={errorId} message={error} />
    </div>
  );
}

function ImportLeadButton({ disabled = false }: { disabled?: boolean }) {
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
          <span>Saving Lead...</span>
        </>
      ) : (
        "Save Imported Lead"
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
