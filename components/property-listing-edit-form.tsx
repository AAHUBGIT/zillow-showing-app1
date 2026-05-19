"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { InlineSpinner } from "@/components/inline-spinner";
import { updatePropertyListing } from "@/lib/actions";
import { fieldMaxLengths } from "@/lib/form-validation";
import { getSourceLabel, leadSourceOptions } from "@/lib/lead-utils";
import {
  getPropertyListingPriceLabel,
  getPropertyListingStatusLabel,
  getPropertyListingTypeLabel,
  normalizePropertyListingType,
  propertyListingTypeOptions,
  propertyListingStatusOptions
} from "@/lib/property-listing-utils";
import type { PropertyListing } from "@/lib/types";

export function PropertyListingEditForm({
  listing,
  isPreviewReadonly,
  redirectTo,
  buttonLabel = "Save Changes"
}: {
  listing: PropertyListing;
  isPreviewReadonly: boolean;
  redirectTo?: string;
  buttonLabel?: string;
}) {
  const [listingType, setListingType] = useState(() => normalizePropertyListingType(listing.listingType));

  return (
    <form action={updatePropertyListing} className="mt-4 grid gap-4">
      <input type="hidden" name="id" value={listing.id} />
      {redirectTo ? <input type="hidden" name="redirectTo" value={redirectTo} /> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <EditField
          label="Listing title"
          name="title"
          defaultValue={listing.title}
          required
          maxLength={fieldMaxLengths.listingTitle}
        />
        <EditField
          label="Address"
          name="address"
          defaultValue={listing.address}
          required
          maxLength={fieldMaxLengths.address}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="flex min-w-0 flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Listing Type</span>
          <select
            name="listingType"
            value={listingType}
            onChange={(event) => setListingType(normalizePropertyListingType(event.target.value))}
            className="app-input bg-white text-ink"
          >
            {propertyListingTypeOptions.map((option) => (
              <option key={option} value={option}>
                {getPropertyListingTypeLabel(option)}
              </option>
            ))}
          </select>
        </label>
        <EditField label={getPropertyListingPriceLabel(listingType)} name="price" defaultValue={listing.price} inputMode="decimal" maxLength={fieldMaxLengths.rent} />
        <EditField label="Beds" name="beds" defaultValue={listing.beds} inputMode="numeric" maxLength={fieldMaxLengths.beds} />
        <EditField label="Baths" name="baths" defaultValue={listing.baths} inputMode="decimal" maxLength={fieldMaxLengths.baths} />
        <EditField label="Neighborhood" name="neighborhood" defaultValue={listing.neighborhood} maxLength={fieldMaxLengths.neighborhood} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="flex min-w-0 flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Source</span>
          <select name="source" defaultValue={listing.source} className="app-input bg-white text-ink">
            {leadSourceOptions.map((source) => (
              <option key={source} value={source}>
                {getSourceLabel(source)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-0 flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Status</span>
          <select name="status" defaultValue={listing.status} className="app-input bg-white text-ink">
            {propertyListingStatusOptions.map((status) => (
              <option key={status} value={status}>
                {getPropertyListingStatusLabel(status)}
              </option>
            ))}
          </select>
        </label>
        <EditField label="Listing URL" name="listingUrl" defaultValue={listing.listingUrl} type="url" maxLength={fieldMaxLengths.listingUrl} />
      </div>

      <label className="flex min-w-0 flex-col gap-2">
        <span className="text-sm font-medium text-slate-700">Notes</span>
        <textarea
          name="notes"
          defaultValue={listing.notes}
          maxLength={fieldMaxLengths.notes}
          rows={3}
          className="app-textarea resize-y"
        />
      </label>

      <div className="flex justify-end">
        <PropertyListingEditButton
          disabled={isPreviewReadonly}
          label={buttonLabel}
        />
      </div>
    </form>
  );
}

function EditField({
  label,
  name,
  defaultValue,
  type = "text",
  required = false,
  inputMode,
  maxLength
}: {
  label: string;
  name: string;
  defaultValue: string;
  type?: string;
  required?: boolean;
  inputMode?: "text" | "numeric" | "decimal";
  maxLength?: number;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-2">
      <span className="text-sm font-medium text-slate-700">
        {label}
        {required ? <span className="text-rose-600"> *</span> : null}
      </span>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        required={required}
        inputMode={inputMode}
        maxLength={maxLength}
        className="app-input"
      />
    </label>
  );
}

function PropertyListingEditButton({
  disabled,
  label
}: {
  disabled: boolean;
  label: string;
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
          <span>Saving...</span>
        </>
      ) : (
        label
      )}
    </button>
  );
}
