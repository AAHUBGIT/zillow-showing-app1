"use client";

import { useMemo, useState, type ReactNode } from "react";
import { PropertyInterestStatusBadge } from "@/components/property-interest-status-badge";
import { PropertyRatingStars } from "@/components/property-rating-stars";
import { PropertyInterest } from "@/lib/types";

type PropertyComparisonTableProps = {
  propertyInterests: PropertyInterest[];
};

type SortMode = "rating" | "price-low" | "price-high";

const comparisonRows: Array<{
  key: string;
  label: string;
  render: (propertyInterest: PropertyInterest) => ReactNode;
}> = [
  {
    key: "price",
    label: "Price",
    render: (propertyInterest) => propertyInterest.rent || "Not added"
  },
  {
    key: "beds",
    label: "Beds",
    render: (propertyInterest) => propertyInterest.beds || "Not added"
  },
  {
    key: "baths",
    label: "Baths",
    render: (propertyInterest) => propertyInterest.baths || "Not added"
  },
  {
    key: "neighborhood",
    label: "Neighborhood",
    render: (propertyInterest) => propertyInterest.neighborhood || "Not added"
  },
  {
    key: "status",
    label: "Status",
    render: (propertyInterest) => (
      <PropertyInterestStatusBadge status={propertyInterest.status} />
    )
  },
  {
    key: "rating",
    label: "Rating",
    render: (propertyInterest) => <PropertyRatingStars rating={propertyInterest.rating} />
  },
  {
    key: "pros",
    label: "Pros",
    render: (propertyInterest) => (
      <PropertyComparisonText value={propertyInterest.pros} fallback="No pros captured yet." />
    )
  },
  {
    key: "cons",
    label: "Cons",
    render: (propertyInterest) => (
      <PropertyComparisonText value={propertyInterest.cons} fallback="No concerns noted yet." />
    )
  }
];

const sortOptions: Array<{ mode: SortMode; label: string }> = [
  { mode: "rating", label: "Best Rated" },
  { mode: "price-low", label: "Lowest Price" },
  { mode: "price-high", label: "Highest Price" }
];

export function PropertyComparisonTable({
  propertyInterests
}: PropertyComparisonTableProps) {
  const [sortMode, setSortMode] = useState<SortMode>("rating");
  const bestRating = Math.max(...propertyInterests.map((propertyInterest) => propertyInterest.rating));

  const sortedPropertyInterests = useMemo(() => {
    return [...propertyInterests].sort((first, second) => {
      if (sortMode === "rating") {
        if (second.rating !== first.rating) {
          return second.rating - first.rating;
        }

        return comparePriceAscending(first, second);
      }

      if (sortMode === "price-low") {
        const byPrice = comparePriceAscending(first, second);
        if (byPrice !== 0) {
          return byPrice;
        }

        return second.rating - first.rating;
      }

      const byPrice = comparePriceDescending(first, second);
      if (byPrice !== 0) {
        return byPrice;
      }

      return second.rating - first.rating;
    });
  }, [propertyInterests, sortMode]);

  return (
    <div className="overflow-hidden rounded-4xl border border-line/80 bg-white/90 shadow-soft">
      <div className="flex flex-col gap-3 border-b border-line/70 bg-slate-50/90 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-tight text-ink">Property comparison</p>
          <p className="mt-1 text-xs text-slate-500">
            Sort by rating or price to see the strongest fit faster.
          </p>
        </div>
        <div
          className="inline-flex flex-wrap gap-2"
          role="group"
          aria-label="Sort compared properties"
        >
          {sortOptions.map((option) => (
            <button
              key={option.mode}
              type="button"
              onClick={() => setSortMode(option.mode)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                sortMode === option.mode
                  ? "border-accent bg-accent text-white shadow-sm"
                  : "border-line/80 bg-white text-slate-600 hover:border-accent hover:text-accent"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[760px] w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-slate-50/95">
              <th className="sticky left-0 z-10 border-b border-line/70 bg-slate-50 px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Compare
              </th>
              {sortedPropertyInterests.map((propertyInterest) => {
                const isTopRated = propertyInterest.rating > 0 && propertyInterest.rating === bestRating;

                return (
                  <th
                    key={propertyInterest.id}
                    className={`min-w-[220px] border-b border-l border-line/60 px-4 py-4 text-left align-top ${
                      isTopRated ? "bg-amber-50/80" : "bg-white/90"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold tracking-tight text-ink">
                          {propertyInterest.listingTitle}
                        </p>
                        {isTopRated ? (
                          <span className="rounded-full border border-amber-200 bg-amber-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-700">
                            Best Rated
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs leading-5 text-slate-500">{propertyInterest.address}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <PropertyInterestStatusBadge status={propertyInterest.status} />
                        <PropertyRatingStars rating={propertyInterest.rating} />
                      </div>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {comparisonRows.map((row) => (
              <tr key={row.key}>
                <th className="sticky left-0 z-10 border-b border-line/60 bg-white px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  {row.label}
                </th>
                {sortedPropertyInterests.map((propertyInterest) => {
                  const isBestRatingCell =
                    row.key === "rating" &&
                    propertyInterest.rating > 0 &&
                    propertyInterest.rating === bestRating;

                  return (
                    <td
                      key={`${row.key}-${propertyInterest.id}`}
                      className={`border-b border-l border-line/60 px-4 py-4 align-top text-sm text-slate-600 ${
                        isBestRatingCell ? "bg-amber-50/70" : "bg-white"
                      }`}
                    >
                      {row.render(propertyInterest)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PropertyComparisonText({
  value,
  fallback
}: {
  value: string;
  fallback: string;
}) {
  return (
    <p className="max-w-[18rem] whitespace-pre-wrap text-sm leading-6 text-slate-600">
      {value || fallback}
    </p>
  );
}

function parseRent(rent: string) {
  const numeric = Number(rent.replace(/[^\d.]/g, ""));
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}

function comparePriceAscending(first: PropertyInterest, second: PropertyInterest) {
  const firstPrice = parseRent(first.rent);
  const secondPrice = parseRent(second.rent);

  if (firstPrice === null && secondPrice === null) {
    return 0;
  }

  if (firstPrice === null) {
    return 1;
  }

  if (secondPrice === null) {
    return -1;
  }

  return firstPrice - secondPrice;
}

function comparePriceDescending(first: PropertyInterest, second: PropertyInterest) {
  const firstPrice = parseRent(first.rent);
  const secondPrice = parseRent(second.rent);

  if (firstPrice === null && secondPrice === null) {
    return 0;
  }

  if (firstPrice === null) {
    return 1;
  }

  if (secondPrice === null) {
    return -1;
  }

  return secondPrice - firstPrice;
}
