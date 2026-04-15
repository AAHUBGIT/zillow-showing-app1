"use client";

import { useFormStatus } from "react-dom";
import { TooltipShell } from "@/components/tooltip-shell";
import { leadSourceOptions } from "@/lib/lead-utils";
import {
  getPropertyInterestSourceLabel,
  getPropertyInterestStatusLabel,
  propertyInterestStatusOptions
} from "@/lib/property-interest-utils";
import { PropertyInterest } from "@/lib/types";

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
  return (
    <form action={action} className="grid gap-5">
      <input type="hidden" name="leadId" value={leadId} />
      {propertyInterest ? <input type="hidden" name="propertyInterestId" value={propertyInterest.id} /> : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Listing title or nickname"
          name="listingTitle"
          defaultValue={propertyInterest?.listingTitle}
          required
        />
        <Field label="Address" name="address" defaultValue={propertyInterest?.address} required />
        <SelectField
          label="Source"
          name="source"
          defaultValue={propertyInterest?.source || "other"}
          options={leadSourceOptions.map((option) => ({
            value: option,
            label: getPropertyInterestSourceLabel(option)
          }))}
        />
        <Field label="Listing URL" name="listingUrl" defaultValue={propertyInterest?.listingUrl} type="url" />
        <Field label="Rent / price" name="rent" defaultValue={propertyInterest?.rent} placeholder="$2,450 / month" />
        <Field label="Neighborhood" name="neighborhood" defaultValue={propertyInterest?.neighborhood} />
        <Field label="Beds" name="beds" defaultValue={propertyInterest?.beds} placeholder="2" />
        <Field label="Baths" name="baths" defaultValue={propertyInterest?.baths} placeholder="2" />
        <SelectField
          label="Status"
          name="status"
          defaultValue={propertyInterest?.status || "interested"}
          options={propertyInterestStatusOptions.map((option) => ({
            value: option,
            label: getPropertyInterestStatusLabel(option)
          }))}
        />
        <SelectField
          label="Rating"
          name="rating"
          defaultValue={String(propertyInterest?.rating || 3)}
          options={[1, 2, 3, 4, 5].map((rating) => ({
            value: String(rating),
            label: `${rating} / 5`
          }))}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <TextAreaField
          label="Pros"
          name="pros"
          rows={5}
          defaultValue={propertyInterest?.pros}
          placeholder="What does the customer like about this property?"
        />
        <TextAreaField
          label="Cons"
          name="cons"
          rows={5}
          defaultValue={propertyInterest?.cons}
          placeholder="Any drawbacks, objections, or deal-breakers."
        />
        <TextAreaField
          label="Agent notes"
          name="agentNotes"
          rows={5}
          defaultValue={propertyInterest?.agentNotes}
          placeholder="Tour notes, access instructions, follow-up points, and context."
        />
      </div>

      <div className="flex justify-end">
        <TooltipShell
          disabled={isPreviewReadonly}
          message="Preview mode is read-only. Disable preview mode or use a live database to save property changes."
        >
          <SubmitButton disabled={isPreviewReadonly} submitLabel={submitLabel} />
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
      {pending ? "Saving..." : submitLabel}
    </button>
  );
}

function Field({
  label,
  name,
  defaultValue = "",
  type = "text",
  placeholder,
  required = false
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        aria-label={label}
        className="app-input"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  defaultValue,
  options
}: {
  label: string;
  name: string;
  defaultValue: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <select name={name} defaultValue={defaultValue} aria-label={label} className="app-input">
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextAreaField({
  label,
  name,
  rows,
  defaultValue = "",
  placeholder
}: {
  label: string;
  name: string;
  rows: number;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-label={label}
        className="app-textarea"
      />
    </label>
  );
}
