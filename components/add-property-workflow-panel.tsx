"use client";

import { useMemo, useState } from "react";
import { AddressAutocompleteInput } from "@/components/address-autocomplete-input";
import { PropertyFitBadges } from "@/components/property-fit-badges";
import { PropertyListingSidePanel } from "@/components/property-listing-side-panel";
import {
  getAddressTitleFallback,
  parseListingUrlDraft,
  propertyListingToWorkflowDraft,
  type PropertyWorkflowDraft
} from "@/lib/property-workflow";
import {
  formatPropertyListingPrice,
  getPropertyListingLayout,
  getPropertyListingStatusLabel,
  propertyListingToFitPropertyInterest
} from "@/lib/property-listing-utils";
import type { LeadWithProperties, PropertyListing } from "@/lib/types";

type WorkflowTab = "saved" | "address" | "url";

const tabs: Array<{ id: WorkflowTab; label: string }> = [
  { id: "saved", label: "Search saved" },
  { id: "address", label: "Search address" },
  { id: "url", label: "Paste URL" }
];

export function AddPropertyWorkflowPanel({
  lead,
  propertyListings,
  onApply,
  manualAddressValue,
  onManualAddressChange,
  compact = false
}: {
  lead?: LeadWithProperties;
  propertyListings: PropertyListing[];
  onApply: (draft: PropertyWorkflowDraft) => void;
  manualAddressValue?: string;
  onManualAddressChange?: (value: string) => void;
  compact?: boolean;
}) {
  const [activeTab, setActiveTab] = useState<WorkflowTab>("saved");
  const [savedSearch, setSavedSearch] = useState("");
  const [addressInput, setAddressInput] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const currentAddressInput = manualAddressValue ?? addressInput;
  const savedMatches = useMemo(() => {
    const query = savedSearch.trim().toLowerCase();

    return propertyListings
      .filter((listing) => {
        if (!query) {
          return listing.status !== "unavailable";
        }

        return [listing.title, listing.address, listing.neighborhood]
          .join(" ")
          .toLowerCase()
          .includes(query);
      })
      .slice(0, compact ? 4 : 6);
  }, [compact, propertyListings, savedSearch]);

  function applyAddress() {
    const address = currentAddressInput.trim();

    if (!address) {
      return;
    }

    onApply({
      listingTitle: getAddressTitleFallback(address),
      address,
      source: "other"
    });
  }

  function updateAddressInput(value: string) {
    setAddressInput(value);
    onManualAddressChange?.(value);
  }

  function applyUrl() {
    const listingUrl = urlInput.trim();

    if (!listingUrl) {
      return;
    }

    onApply(parseListingUrlDraft(listingUrl));
  }

  return (
    <section className="rounded-3xl border border-line/80 bg-white/90 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="app-kicker">Add Property</p>
          <h3 className="mt-2 text-lg font-semibold tracking-tight text-ink">
            Start with an address or listing link
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Start with an address or listing link. You can review and edit details before saving.
          </p>
        </div>
        <div className="app-chip">Review before save</div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Add Property modes">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition ${
              activeTab === tab.id
                ? "border-accent bg-accent text-white"
                : "border-line/80 bg-white text-slate-700 hover:border-accent"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {activeTab === "saved" ? (
          <div className="grid gap-3">
            <label className="flex min-w-0 flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">Search saved properties</span>
              <input
                type="search"
                value={savedSearch}
                onChange={(event) => setSavedSearch(event.target.value)}
                placeholder="Search by title, address, or neighborhood"
                className="app-input"
              />
            </label>

            {savedMatches.length > 0 ? (
              <div className="grid gap-3">
                {savedMatches.map((listing) => (
                  <div
                    key={listing.id}
                    className="rounded-2xl border border-line/80 bg-slate-50/80 px-4 py-3"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-ink">{listing.title}</p>
                          <span className="rounded-full border border-line/80 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                            {getPropertyListingStatusLabel(listing.status)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm leading-5 text-slate-600">{listing.address}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="app-chip">{formatPropertyListingPrice(listing.price, listing.listingType)}</span>
                          <span className="app-chip">{getPropertyListingLayout(listing)}</span>
                          {listing.neighborhood ? <span className="app-chip">{listing.neighborhood}</span> : null}
                          {listing.source ? <span className="app-chip">{listing.source}</span> : null}
                        </div>
                        {lead ? (
                          <div className="mt-3">
                            <PropertyFitBadges
                              lead={lead}
                              propertyInterest={propertyListingToFitPropertyInterest(listing, lead.id)}
                              compact
                            />
                          </div>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-2 md:justify-end">
                        <PropertyListingSidePanel
                          listing={listing}
                          triggerLabel="Preview"
                          triggerClassName="app-button-secondary min-h-[44px] px-4 py-2 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => onApply(propertyListingToWorkflowDraft(listing))}
                          className="app-button-primary min-h-[44px] px-4 py-2 text-sm"
                        >
                          Use property
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-line bg-slate-50 px-4 py-3 text-sm text-slate-500">
                No saved properties match yet. Add inventory from the Properties page or use an address.
              </p>
            )}
          </div>
        ) : null}

        {activeTab === "address" ? (
          <div className="grid gap-3">
            <AddressAutocompleteInput
              label="Search address"
              value={currentAddressInput}
              onChange={updateAddressInput}
              onSelect={(selection) => {
                updateAddressInput(selection.formattedAddress);
                onApply({
                  listingTitle: getAddressTitleFallback(selection.formattedAddress),
                  address: selection.formattedAddress,
                  neighborhood: selection.neighborhood,
                  source: "other"
                });
              }}
              helperText="Start typing to see address suggestions, or enter the address manually."
            />
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={applyAddress}
                disabled={!currentAddressInput.trim()}
                className="app-button-primary disabled:cursor-not-allowed disabled:opacity-55"
              >
                Use this address
              </button>
              <p className="text-xs leading-5 text-slate-500">
                Manual fallback stays available even when autocomplete is enabled.
              </p>
            </div>
          </div>
        ) : null}

        {activeTab === "url" ? (
          <div className="grid gap-3">
            <label className="flex min-w-0 flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">Listing URL</span>
              <input
                type="url"
                value={urlInput}
                onChange={(event) => setUrlInput(event.target.value)}
                placeholder="https://www.zillow.com/..."
                className="app-input"
              />
            </label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={applyUrl}
                disabled={!urlInput.trim()}
                className="app-button-primary disabled:cursor-not-allowed disabled:opacity-55"
              >
                Use listing link
              </button>
              <p className="text-xs leading-5 text-slate-500">
                We&apos;ll save the listing link now. Full listing detail import can be connected later.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
