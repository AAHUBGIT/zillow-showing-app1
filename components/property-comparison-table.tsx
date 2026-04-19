import type { ReactNode } from "react";
import { PropertyInterestStatusBadge } from "@/components/property-interest-status-badge";
import { PropertyRatingStars } from "@/components/property-rating-stars";
import { PropertyInterest } from "@/lib/types";

type PropertyComparisonTableProps = {
  propertyInterests: PropertyInterest[];
};

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

export function PropertyComparisonTable({
  propertyInterests
}: PropertyComparisonTableProps) {
  const bestRating = Math.max(...propertyInterests.map((propertyInterest) => propertyInterest.rating));

  return (
    <div className="overflow-hidden rounded-4xl border border-line/80 bg-white/90 shadow-soft">
      <div className="overflow-x-auto">
        <table className="min-w-[760px] w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-slate-50/95">
              <th className="sticky left-0 z-10 border-b border-line/70 bg-slate-50 px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Compare
              </th>
              {propertyInterests.map((propertyInterest) => {
                const isTopRated = propertyInterest.rating > 0 && propertyInterest.rating === bestRating;

                return (
                  <th
                    key={propertyInterest.id}
                    className={`min-w-[220px] border-b border-l border-line/60 px-4 py-4 text-left align-top ${
                      isTopRated ? "bg-amber-50/80" : "bg-white/90"
                    }`}
                  >
                    <div className="space-y-2">
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
                {propertyInterests.map((propertyInterest) => {
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
