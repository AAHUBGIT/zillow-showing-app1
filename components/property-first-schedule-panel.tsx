"use client";

import { useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useFormStatus } from "react-dom";
import { DateTimePickerFields, type DateTimePickerHandle } from "@/components/date-time-picker-fields";
import { InlineSpinner } from "@/components/inline-spinner";
import { LeadStatusBadge } from "@/components/lead-status-badge";
import { LoadingLink } from "@/components/loading-link";
import { PriorityBadge } from "@/components/priority-badge";
import { SidePanel } from "@/components/side-panel";
import { TooltipShell } from "@/components/tooltip-shell";
import { schedulePropertyForLead } from "@/lib/actions";
import { emitAppToast } from "@/lib/client-toast";
import { formatDateLabel } from "@/lib/date";
import { fieldMaxLengths } from "@/lib/form-validation";
import {
  formatPropertyListingPrice,
  getPropertyListingLayout,
  normalizePropertyListingAddress,
  normalizePropertyListingUrl
} from "@/lib/property-listing-utils";
import type { LeadWithProperties, PropertyListing } from "@/lib/types";

type ScheduleStatus = "scheduled" | "confirmed";

function hasAttachedProperty(lead: LeadWithProperties, listing: PropertyListing) {
  const listingAddress = normalizePropertyListingAddress(listing.address);
  const listingUrl = normalizePropertyListingUrl(listing.listingUrl);

  return lead.propertyInterests.some((propertyInterest) => {
    const sameAddress =
      listingAddress &&
      normalizePropertyListingAddress(propertyInterest.address) === listingAddress;
    const sameListingUrl =
      listingUrl &&
      normalizePropertyListingUrl(propertyInterest.listingUrl) === listingUrl;

    return sameAddress || sameListingUrl;
  });
}

export function PropertyFirstSchedulePanel({
  listing,
  leads,
  isPreviewReadonly = false
}: {
  listing: PropertyListing;
  leads: LeadWithProperties[];
  isPreviewReadonly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [attachProperty, setAttachProperty] = useState(true);
  const [showingStatus, setShowingStatus] = useState<ScheduleStatus>("scheduled");
  const [formError, setFormError] = useState("");
  const scheduleRef = useRef<DateTimePickerHandle>(null);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredLeads = useMemo(() => {
    const candidates = normalizedQuery
      ? leads.filter((lead) =>
          [
            lead.fullName,
            lead.phone,
            lead.email,
            lead.propertyAddress
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery)
        )
      : leads;

    return candidates.slice(0, 8);
  }, [leads, normalizedQuery]);
  const selectedLead = leads.find((lead) => lead.id === selectedLeadId) || null;
  const alreadyAttached = selectedLead ? hasAttachedProperty(selectedLead, listing) : false;

  function selectLead(lead: LeadWithProperties) {
    setSelectedLeadId(lead.id);
    setAttachProperty(!hasAttachedProperty(lead, listing));
    setFormError("");
  }

  function validateSubmit(event: FormEvent<HTMLFormElement>) {
    const isScheduleValid = scheduleRef.current?.validate() ?? false;
    const values = scheduleRef.current?.getValues() || { date: "", time: "" };

    if (!selectedLeadId) {
      event.preventDefault();
      setFormError("Choose a customer before scheduling.");
      emitAppToast({ toastKey: "validation-error" });
      return;
    }

    if (!values.date || !values.time || !isScheduleValid) {
      event.preventDefault();
      setFormError("Choose a valid showing date and time before scheduling.");
      emitAppToast({ toastKey: "validation-error" });
      return;
    }

    setFormError("");
  }

  return (
    <>
      <button
        type="button"
        className="app-button-primary"
        onClick={() => setOpen(true)}
      >
        Schedule This Property
      </button>

      <SidePanel
        open={open}
        onClose={() => setOpen(false)}
        eyebrow="Property Scheduling"
        title="Schedule this property"
      >
        <div className="space-y-5">
          <section className="rounded-3xl border border-line/80 bg-slate-50/80 p-4">
            <p className="text-sm font-semibold text-ink">{listing.title}</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">{listing.address}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="app-chip">{formatPropertyListingPrice(listing.price)}</span>
              <span className="app-chip">{getPropertyListingLayout(listing)}</span>
              {listing.neighborhood ? <span className="app-chip">{listing.neighborhood}</span> : null}
            </div>
          </section>

          <section className="rounded-3xl border border-line/80 bg-white p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="app-kicker">Select Customer</p>
                <p className="mt-1 text-sm text-slate-600">
                  Search by name, phone, email, or primary address.
                </p>
              </div>
              <LoadingLink href="/leads/new" className="app-button-secondary min-h-[38px] px-3 py-2 text-xs">
                New Lead
              </LoadingLink>
            </div>

            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="app-input mt-3"
              placeholder="Search customers"
            />

            <div className="mt-3 grid gap-2">
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => {
                  const attached = hasAttachedProperty(lead, listing);

                  return (
                    <button
                      key={lead.id}
                      type="button"
                      onClick={() => selectLead(lead)}
                      className={`rounded-2xl border px-3 py-3 text-left transition ${
                        selectedLeadId === lead.id
                          ? "border-accent bg-accentSoft/70"
                          : "border-line/80 bg-slate-50/80 hover:border-accent"
                      }`}
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="font-semibold text-ink">{lead.fullName}</p>
                          <p className="mt-1 truncate text-sm text-slate-600">
                            {lead.phone || lead.email || lead.propertyAddress}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <LeadStatusBadge status={lead.status} />
                          <PriorityBadge priority={lead.priority} />
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="app-chip">
                          Follow-up {lead.nextFollowUpDate ? formatDateLabel(lead.nextFollowUpDate) : "not set"}
                        </span>
                        {attached ? <span className="app-chip">Already attached</span> : null}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-dashed border-line bg-slate-50 px-4 py-5 text-sm text-slate-500">
                  No matching customers found.
                  <LoadingLink href="/leads/new" className="app-button-secondary mt-3 w-full">
                    Add New Lead
                  </LoadingLink>
                </div>
              )}
            </div>
          </section>

          <form action={schedulePropertyForLead} noValidate onSubmit={validateSubmit} className="rounded-3xl border border-line/80 bg-white p-4">
            <input type="hidden" name="propertyListingId" value={listing.id} />
            <input type="hidden" name="leadId" value={selectedLeadId} />
            <input type="hidden" name="redirectTo" value={`/properties/${listing.id}`} />
            <input type="hidden" name="attachPropertyToLead" value={alreadyAttached || attachProperty ? "true" : "false"} />

            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="app-kicker">Schedule Showing</p>
                <p className="mt-1 text-sm text-slate-600">
                  This uses the property address as the showing location.
                </p>
              </div>
              {selectedLead ? (
                <span className="app-chip">{selectedLead.fullName}</span>
              ) : null}
            </div>

            <div className="mt-4 grid gap-4">
              <DateTimePickerFields
                ref={scheduleRef}
                dateName="showingDate"
                timeName="showingTime"
                allowPastDateOverrideName="showingDateAllowPastOverride"
                dateLabel="Showing date"
                timeLabel="Showing time"
                dateAriaLabel="property-first showing date"
                timeAriaLabel="property-first showing time"
              />

              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">Showing status</span>
                <select
                  name="showingStatus"
                  value={showingStatus}
                  onChange={(event) => setShowingStatus(event.target.value as ScheduleStatus)}
                  className="app-input bg-white text-ink"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="confirmed">Confirmed</option>
                </select>
              </label>

              {selectedLead ? (
                <label className="flex items-start gap-3 rounded-2xl border border-line/80 bg-slate-50/90 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={alreadyAttached || attachProperty}
                    disabled={alreadyAttached}
                    onChange={(event) => setAttachProperty(event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-line accent-blue-600 disabled:opacity-50"
                  />
                  <span className="text-sm leading-6 text-slate-700">
                    <span className="font-semibold text-ink">
                      {alreadyAttached ? "Already attached" : "Attach this property to the customer"}
                    </span>
                    <br />
                    {alreadyAttached
                      ? "This customer already has this property in their interested list."
                      : "Default on. Creates an interested property if one does not already exist."}
                  </span>
                </label>
              ) : null}

              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">Route / showing notes</span>
                <textarea
                  name="showingNotes"
                  rows={3}
                  maxLength={fieldMaxLengths.agentNotes}
                  className="app-textarea"
                  placeholder="Access code, parking, timing, or showing reminders."
                />
              </label>

              <p className="text-xs leading-5 text-slate-500">
                Current limitation: this saves one active showing on the lead record until the
                app gets a first-class Showing/TourStop model.
              </p>

              {formError ? (
                <p className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
                  {formError}
                </p>
              ) : null}

              <TooltipShell
                disabled={isPreviewReadonly}
                message="This preview workspace is read-only. Use a live workspace to schedule showings."
              >
                <ScheduleSubmitButton disabled={isPreviewReadonly} />
              </TooltipShell>
            </div>
          </form>
        </div>
      </SidePanel>
    </>
  );
}

function ScheduleSubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="app-button-primary justify-self-start disabled:cursor-not-allowed disabled:opacity-55"
    >
      {pending ? (
        <>
          <InlineSpinner />
          <span>Scheduling...</span>
        </>
      ) : (
        "Save Showing"
      )}
    </button>
  );
}
