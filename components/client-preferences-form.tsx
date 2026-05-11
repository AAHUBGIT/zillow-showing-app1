"use client";

import { useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { AutoResizeTextarea } from "@/components/auto-resize-textarea";
import { InlineSpinner } from "@/components/inline-spinner";
import { TooltipShell } from "@/components/tooltip-shell";
import { updateLeadPreferences } from "@/lib/actions";
import { emitAppToast } from "@/lib/client-toast";
import {
  getBedroomBathroomLabel,
  getBudgetLabel,
  getMoveInUrgencyLabel,
  getPreScreenStatus,
  hasClientPreferences,
  moveInUrgencyOptions
} from "@/lib/client-preferences";
import {
  fieldMaxLengths,
  getMaxLengthError,
  getNumericError
} from "@/lib/form-validation";
import { LeadWithProperties } from "@/lib/types";

type TextFieldName =
  | "budgetMin"
  | "budgetMax"
  | "bedrooms"
  | "bathrooms"
  | "preferredNeighborhoods"
  | "moveInUrgency"
  | "mustHaves"
  | "dealBreakers"
  | "pets"
  | "preScreeningNotes";

type CheckboxFieldName = "incomeQualified" | "creditConcern" | "hasGuarantor" | "applicationReady";

type PreferenceFormValues = Record<TextFieldName, string> & Record<CheckboxFieldName, boolean>;
type FieldErrors = Partial<Record<TextFieldName, string>>;

const textFieldOrder: TextFieldName[] = [
  "budgetMin",
  "budgetMax",
  "bedrooms",
  "bathrooms",
  "preferredNeighborhoods",
  "moveInUrgency",
  "mustHaves",
  "dealBreakers",
  "pets",
  "preScreeningNotes"
];

function getInitialValues(lead: LeadWithProperties): PreferenceFormValues {
  return {
    budgetMin: lead.budgetMin,
    budgetMax: lead.budgetMax,
    bedrooms: lead.bedrooms,
    bathrooms: lead.bathrooms,
    preferredNeighborhoods: lead.preferredNeighborhoods,
    moveInUrgency: lead.moveInUrgency,
    mustHaves: lead.mustHaves,
    dealBreakers: lead.dealBreakers,
    pets: lead.pets,
    incomeQualified: lead.incomeQualified,
    creditConcern: lead.creditConcern,
    hasGuarantor: lead.hasGuarantor,
    applicationReady: lead.applicationReady,
    preScreeningNotes: lead.preScreeningNotes
  };
}

function getFieldError(name: TextFieldName, value: string) {
  switch (name) {
    case "budgetMin":
    case "budgetMax":
      return getNumericError(value) || getMaxLengthError(value, fieldMaxLengths.budget);
    case "bedrooms":
      return getNumericError(value, false) || getMaxLengthError(value, fieldMaxLengths.bedrooms);
    case "bathrooms":
      return getNumericError(value) || getMaxLengthError(value, fieldMaxLengths.bathrooms);
    case "preferredNeighborhoods":
      return getMaxLengthError(value, fieldMaxLengths.preferredNeighborhoods);
    case "moveInUrgency":
      return getMaxLengthError(value, fieldMaxLengths.moveInUrgency);
    case "mustHaves":
      return getMaxLengthError(value, fieldMaxLengths.mustHaves);
    case "dealBreakers":
      return getMaxLengthError(value, fieldMaxLengths.dealBreakers);
    case "pets":
      return getMaxLengthError(value, fieldMaxLengths.pets);
    case "preScreeningNotes":
      return getMaxLengthError(value, fieldMaxLengths.preScreeningNotes);
    default:
      return "";
  }
}

function buildErrors(values: PreferenceFormValues) {
  return textFieldOrder.reduce<FieldErrors>((current, name) => {
    const nextError = getFieldError(name, values[name]);

    if (!nextError) {
      return current;
    }

    return { ...current, [name]: nextError };
  }, {});
}

export function ClientPreferencesForm({
  lead,
  isPreviewReadonly = false
}: {
  lead: LeadWithProperties;
  isPreviewReadonly?: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<PreferenceFormValues>(() => getInitialValues(lead));
  const [errors, setErrors] = useState<FieldErrors>({});
  const leadPreview = { ...lead, ...values };
  const hasStoredPreferences = hasClientPreferences(lead);
  const [isExpanded, setIsExpanded] = useState(false);

  const isFormValid = useMemo(() => Object.keys(buildErrors(values)).length === 0, [values]);

  function updateTextField(name: TextFieldName, value: string) {
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

  function updateCheckbox(name: CheckboxFieldName, checked: boolean) {
    setValues((current) => ({ ...current, [name]: checked }));
  }

  function focusFirstInvalid(nextErrors: FieldErrors) {
    for (const name of textFieldOrder) {
      if (nextErrors[name]) {
        const field = formRef.current?.querySelector<HTMLElement>(`[data-field="${name}"]`);
        field?.focus();
        return;
      }
    }
  }

  function validateForm() {
    const nextErrors = buildErrors(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      emitAppToast({ toastKey: "validation-error" });
      focusFirstInvalid(nextErrors);
      return false;
    }

    return true;
  }

  return (
    <section className="app-panel p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="app-eyebrow">Client Preferences</p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-ink sm:text-2xl">
            Preferences and pre-screening
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            {hasStoredPreferences
              ? "Budget, timing, qualification, and match criteria for this customer."
              : "Capture budget, timing, qualification, and property fit criteria."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <div className="app-chip">{getPreScreenStatus(leadPreview)}</div>
          <button
            type="button"
            onClick={() => setIsExpanded((current) => !current)}
            className="app-button-secondary min-h-[40px] px-4 py-2 text-xs"
            aria-expanded={isExpanded}
            aria-controls="client-preferences-editor"
          >
            {isExpanded ? "Collapse" : hasStoredPreferences ? "Edit preferences" : "Add preferences"}
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        <SummaryTile label="Budget" value={getBudgetLabel(leadPreview)} />
        <SummaryTile label="Beds/Baths" value={getBedroomBathroomLabel(leadPreview)} />
        <SummaryTile
          label="Neighborhoods"
          value={leadPreview.preferredNeighborhoods || "Not set"}
        />
        <SummaryTile
          label="Move-in urgency"
          value={getMoveInUrgencyLabel(leadPreview.moveInUrgency)}
        />
      </div>

      {isExpanded ? (
        <form
          id="client-preferences-editor"
          ref={formRef}
          action={updateLeadPreferences}
          noValidate
          onSubmit={(event) => {
            if (!validateForm()) {
              event.preventDefault();
            }
          }}
          className="mt-6 grid gap-5 border-t border-line pt-5"
        >
          <input type="hidden" name="id" value={lead.id} />

          <div className="grid gap-4 md:grid-cols-4">
            <ValidatedField
              label="Budget min"
              name="budgetMin"
              value={values.budgetMin}
              error={errors.budgetMin}
              inputMode="numeric"
              maxLength={fieldMaxLengths.budget}
              onChange={updateTextField}
            />
            <ValidatedField
              label="Budget max"
              name="budgetMax"
              value={values.budgetMax}
              error={errors.budgetMax}
              inputMode="numeric"
              maxLength={fieldMaxLengths.budget}
              onChange={updateTextField}
            />
            <ValidatedField
              label="Bedrooms"
              name="bedrooms"
              value={values.bedrooms}
              error={errors.bedrooms}
              inputMode="numeric"
              maxLength={fieldMaxLengths.bedrooms}
              onChange={updateTextField}
            />
            <ValidatedField
              label="Bathrooms"
              name="bathrooms"
              value={values.bathrooms}
              error={errors.bathrooms}
              inputMode="decimal"
              maxLength={fieldMaxLengths.bathrooms}
              onChange={updateTextField}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-[1.4fr_0.8fr_0.8fr]">
            <ValidatedField
              label="Preferred neighborhoods"
              name="preferredNeighborhoods"
              value={values.preferredNeighborhoods}
              error={errors.preferredNeighborhoods}
              maxLength={fieldMaxLengths.preferredNeighborhoods}
              onChange={updateTextField}
            />
            <ValidatedSelect
              label="Move-in urgency"
              name="moveInUrgency"
              value={values.moveInUrgency}
              error={errors.moveInUrgency}
              onChange={updateTextField}
            />
            <ValidatedField
              label="Pets"
              name="pets"
              value={values.pets}
              error={errors.pets}
              maxLength={fieldMaxLengths.pets}
              onChange={updateTextField}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ValidatedTextarea
              label="Must-haves"
              name="mustHaves"
              rows={4}
              value={values.mustHaves}
              error={errors.mustHaves}
              maxLength={fieldMaxLengths.mustHaves}
              onChange={updateTextField}
            />
            <ValidatedTextarea
              label="Dealbreakers"
              name="dealBreakers"
              rows={4}
              value={values.dealBreakers}
              error={errors.dealBreakers}
              maxLength={fieldMaxLengths.dealBreakers}
              onChange={updateTextField}
            />
          </div>

          <div className="app-subpanel p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="app-kicker">Pre-screening</p>
                <p className="mt-2 text-sm font-semibold text-slate-700">
                  {getPreScreenStatus(leadPreview)}
                  {leadPreview.applicationReady ? " - Application ready" : ""}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <PreferenceCheckbox
                  label="Income qualified"
                  name="incomeQualified"
                  checked={values.incomeQualified}
                  onChange={updateCheckbox}
                />
                <PreferenceCheckbox
                  label="Credit concern"
                  name="creditConcern"
                  checked={values.creditConcern}
                  onChange={updateCheckbox}
                />
                <PreferenceCheckbox
                  label="Has guarantor"
                  name="hasGuarantor"
                  checked={values.hasGuarantor}
                  onChange={updateCheckbox}
                />
                <PreferenceCheckbox
                  label="Application ready"
                  name="applicationReady"
                  checked={values.applicationReady}
                  onChange={updateCheckbox}
                />
              </div>
            </div>

            <div className="mt-5">
              <ValidatedTextarea
                label="Qualification notes"
                name="preScreeningNotes"
                rows={4}
                value={values.preScreeningNotes}
                error={errors.preScreeningNotes}
                maxLength={fieldMaxLengths.preScreeningNotes}
                onChange={updateTextField}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-700">
                {getPreScreenStatus(leadPreview)}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {leadPreview.preScreeningNotes || "No qualification notes added yet."}
              </p>
            </div>
            <div className="flex flex-col items-stretch gap-2 sm:items-end">
              {!isFormValid ? (
                <p className="text-xs font-medium text-slate-500">
                  Fix the highlighted fields before saving preferences.
                </p>
              ) : null}
              <TooltipShell
                disabled={isPreviewReadonly}
                message="This preview workspace is read-only. Use a live workspace to update leads."
              >
                <SavePreferencesButton disabled={isPreviewReadonly || !isFormValid} />
              </TooltipShell>
            </div>
          </div>
        </form>
      ) : null}
    </section>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-line/70 bg-slate-50 px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-700">{value}</p>
    </div>
  );
}

function SavePreferencesButton({ disabled = false }: { disabled?: boolean }) {
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
          <span>Saving Preferences...</span>
        </>
      ) : (
        "Save Preferences"
      )}
    </button>
  );
}

function ValidatedField({
  label,
  name,
  value,
  error,
  inputMode,
  maxLength,
  onChange
}: {
  label: string;
  name: TextFieldName;
  value: string;
  error?: string;
  inputMode?: "text" | "numeric" | "decimal";
  maxLength: number;
  onChange: (name: TextFieldName, value: string) => void;
}) {
  const helpId = `${name}-help`;
  const errorId = `${name}-error`;

  return (
    <label className="flex min-w-0 flex-col gap-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        type="text"
        name={name}
        value={value}
        inputMode={inputMode}
        maxLength={maxLength}
        data-field={name}
        aria-label={label}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${helpId} ${errorId}` : helpId}
        onChange={(event) => onChange(name, event.target.value)}
        className={`app-input ${error ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100" : ""}`}
      />
      <p id={helpId} className="text-xs text-slate-500">
        Optional field.
      </p>
      <FieldError id={errorId} message={error} />
    </label>
  );
}

function ValidatedSelect({
  label,
  name,
  value,
  error,
  onChange
}: {
  label: string;
  name: TextFieldName;
  value: string;
  error?: string;
  onChange: (name: TextFieldName, value: string) => void;
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
        {moveInUrgencyOptions.map((option) => (
          <option key={option || "not-set"} value={option}>
            {getMoveInUrgencyLabel(option)}
          </option>
        ))}
      </select>
      <p id={helpId} className="text-xs text-slate-500">
        Optional field.
      </p>
      <FieldError id={errorId} message={error} />
    </label>
  );
}

function ValidatedTextarea({
  label,
  name,
  rows,
  value,
  error,
  maxLength,
  onChange
}: {
  label: string;
  name: TextFieldName;
  rows: number;
  value: string;
  error?: string;
  maxLength: number;
  onChange: (name: TextFieldName, value: string) => void;
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
        aria-label={label}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${helpId} ${errorId}` : helpId}
        onChange={(event) => onChange(name, event.target.value)}
        className={`app-textarea ${error ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100" : ""}`}
      />
      <p id={helpId} className="text-xs text-slate-500">
        Optional field.
      </p>
      <FieldError id={errorId} message={error} />
    </label>
  );
}

function PreferenceCheckbox({
  label,
  name,
  checked,
  onChange
}: {
  label: string;
  name: CheckboxFieldName;
  checked: boolean;
  onChange: (name: CheckboxFieldName, checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-line/70 bg-white px-4 py-3 text-sm font-medium text-slate-700">
      <input
        type="checkbox"
        name={name}
        value="true"
        checked={checked}
        onChange={(event) => onChange(name, event.target.checked)}
        className="h-4 w-4 rounded border-line text-accent focus:ring-accent/20"
      />
      <span>{label}</span>
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
