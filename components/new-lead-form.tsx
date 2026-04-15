"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { createLead } from "@/lib/actions";
import { DateTimePickerFields, DateTimePickerHandle } from "@/components/date-time-picker-fields";
import { TooltipShell } from "@/components/tooltip-shell";
import {
  getPriorityLabel,
  getSourceLabel,
  getStatusLabel,
  leadPriorityOptions,
  leadSourceOptions,
  leadStatusOptions
} from "@/lib/lead-utils";

type FieldErrors = Partial<Record<string, string>>;

const fieldOrder = [
  "fullName",
  "phone",
  "email",
  "propertyAddress",
  "desiredMoveInDate",
  "status",
  "priority",
  "source"
];

function validateEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validatePhone(value: string) {
  return value.replace(/\D/g, "").length >= 10;
}

function getFieldError(name: string, value: string) {
  const trimmed = value.trim();

  if (["fullName", "phone", "email", "propertyAddress", "desiredMoveInDate"].includes(name) && !trimmed) {
    return "This field is required.";
  }

  if (["status", "priority", "source"].includes(name) && !trimmed) {
    return "Please choose an option.";
  }

  if (name === "email" && trimmed && !validateEmail(trimmed)) {
    return "Enter a valid email address.";
  }

  if (name === "phone" && trimmed && !validatePhone(trimmed)) {
    return "Enter a valid phone number.";
  }

  return "";
}

export function NewLeadForm({ isPreviewReadonly = false }: { isPreviewReadonly?: boolean }) {
  const formRef = useRef<HTMLFormElement>(null);
  const scheduleRef = useRef<DateTimePickerHandle>(null);
  const [errors, setErrors] = useState<FieldErrors>({});

  function setFieldError(name: string, value: string) {
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
    for (const name of fieldOrder) {
      if (nextErrors[name]) {
        const field = formRef.current?.querySelector<HTMLElement>(`[data-field="${name}"]`);
        field?.focus();
        return;
      }
    }

    scheduleRef.current?.focusDate();
  }

  function validateForm() {
    const formElement = formRef.current;
    if (!formElement) {
      return true;
    }

    const formData = new FormData(formElement);
    const nextErrors: FieldErrors = {};

    for (const name of fieldOrder) {
      const value = String(formData.get(name) ?? "");
      const nextError = getFieldError(name, value);

      if (nextError) {
        nextErrors[name] = nextError;
      }
    }

    const isScheduleValid = scheduleRef.current?.validate() ?? true;
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      focusFirstInvalid(nextErrors);
      return false;
    }

    if (!isScheduleValid) {
      scheduleRef.current?.focusDate();
      return false;
    }

    return true;
  }

  return (
    <form
      ref={formRef}
      action={createLead}
      noValidate
      onSubmit={(event) => {
        if (!validateForm()) {
          event.preventDefault();
        }
      }}
      className="mt-8 grid gap-5 sm:grid-cols-2"
    >
      <ValidatedField
        label="Full name"
        name="fullName"
        type="text"
        required
        errors={errors}
        onBlur={setFieldError}
        autoComplete="name"
      />
      <ValidatedField
        label="Phone"
        name="phone"
        type="tel"
        required
        errors={errors}
        onBlur={setFieldError}
        autoComplete="tel"
      />
      <ValidatedField
        label="Email"
        name="email"
        type="email"
        required
        errors={errors}
        onBlur={setFieldError}
        autoComplete="email"
      />
      <ValidatedField
        label="Property address"
        name="propertyAddress"
        type="text"
        required
        errors={errors}
        onBlur={setFieldError}
        autoComplete="street-address"
      />
      <ValidatedField
        label="Desired move-in date"
        name="desiredMoveInDate"
        type="date"
        required
        errors={errors}
        onBlur={setFieldError}
      />
      <ValidatedField
        label="Next follow-up date"
        name="nextFollowUpDate"
        type="date"
        errors={errors}
        onBlur={setFieldError}
      />

      <ValidatedSelect
        label="Status"
        name="status"
        defaultValue="new"
        options={leadStatusOptions.map((option) => ({
          value: option,
          label: getStatusLabel(option)
        }))}
        errors={errors}
        onBlur={setFieldError}
      />

      <ValidatedSelect
        label="Priority"
        name="priority"
        defaultValue="medium"
        options={leadPriorityOptions.map((option) => ({
          value: option,
          label: getPriorityLabel(option)
        }))}
        errors={errors}
        onBlur={setFieldError}
      />

      <ValidatedSelect
        label="Lead source"
        name="source"
        defaultValue="other"
        options={leadSourceOptions.map((option) => ({
          value: option,
          label: getSourceLabel(option)
        }))}
        errors={errors}
        onBlur={setFieldError}
      />

      <div className="rounded-3xl border border-line/70 bg-slate-50/80 px-4 py-4">
        <p className="app-kicker">Lead Quality</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Use priority and follow-up date to keep urgent inquiries and time-sensitive leads near
          the top of the dashboard.
        </p>
      </div>

      <div className="sm:col-span-2">
        <ValidatedTextarea
          label="Notes"
          name="notes"
          rows={4}
          placeholder="Example: Prefers first-floor units, works downtown, wants parking."
          errors={errors}
          onBlur={setFieldError}
        />
      </div>

      <div className="sm:col-span-2 app-subpanel p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-ink">Optional first showing setup</p>
            <p className="mt-1 text-sm text-slate-600">
              Capture the showing now if you already have a scheduled tour.
            </p>
          </div>
          <div className="app-chip">Optional</div>
        </div>

        <div className="mt-5">
          <DateTimePickerFields
            ref={scheduleRef}
            dateName="showingDate"
            timeName="showingTime"
            dateLabel="Showing date"
            timeLabel="Showing time"
            dateAriaLabel="showing date"
            timeAriaLabel="showing time"
          />
        </div>

        <div className="mt-5">
          <ValidatedTextarea
            label="Agent notes"
            name="agentNotes"
            rows={3}
            placeholder="Lockbox code, parking tips, pet policy reminders, and so on."
            errors={errors}
            onBlur={setFieldError}
          />
        </div>
      </div>

      <div className="sm:col-span-2 flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-600">Create a record with real context</p>
          <p className="mt-1 text-sm text-slate-500">
            Priority, source, and follow-up timing help the dashboard rank the lead intelligently.
          </p>
        </div>
        <TooltipShell
          disabled={isPreviewReadonly}
          message="Preview mode is read-only. Disable preview mode or use a live database to create leads."
        >
          <CreateLeadButton disabled={isPreviewReadonly} />
        </TooltipShell>
      </div>
    </form>
  );
}

function CreateLeadButton({ disabled = false }: { disabled?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="app-button-primary disabled:cursor-not-allowed disabled:opacity-55"
    >
      {pending ? "Saving..." : "Create Lead"}
    </button>
  );
}

function ValidatedField({
  label,
  name,
  type = "text",
  required = false,
  errors,
  onBlur,
  autoComplete
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  errors: FieldErrors;
  onBlur: (name: string, value: string) => void;
  autoComplete?: string;
}) {
  const error = errors[name];
  const helpId = `${name}-help`;
  const errorId = `${name}-error`;

  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        name={name}
        required={required}
        autoComplete={autoComplete}
        data-field={name}
        aria-label={label}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${helpId} ${errorId}` : helpId}
        onBlur={(event) => onBlur(name, event.target.value)}
        className={`app-input ${error ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100" : ""}`}
      />
      <p id={helpId} className="text-xs text-slate-500">
        {required ? "Required field." : "Optional field."}
      </p>
      <FieldError id={errorId} message={error} />
    </label>
  );
}

function ValidatedSelect({
  label,
  name,
  defaultValue,
  options,
  errors,
  onBlur
}: {
  label: string;
  name: string;
  defaultValue: string;
  options: Array<{ value: string; label: string }>;
  errors: FieldErrors;
  onBlur: (name: string, value: string) => void;
}) {
  const error = errors[name];
  const helpId = `${name}-help`;
  const errorId = `${name}-error`;

  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        data-field={name}
        aria-label={label}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${helpId} ${errorId}` : helpId}
        onBlur={(event) => onBlur(name, event.target.value)}
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
      <FieldError id={errorId} message={error} />
    </label>
  );
}

function ValidatedTextarea({
  label,
  name,
  rows,
  placeholder,
  errors,
  onBlur
}: {
  label: string;
  name: string;
  rows: number;
  placeholder: string;
  errors: FieldErrors;
  onBlur: (name: string, value: string) => void;
}) {
  const error = errors[name];
  const helpId = `${name}-help`;
  const errorId = `${name}-error`;

  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <textarea
        name={name}
        rows={rows}
        placeholder={placeholder}
        data-field={name}
        aria-label={label}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${helpId} ${errorId}` : helpId}
        onBlur={(event) => onBlur(name, event.target.value)}
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
