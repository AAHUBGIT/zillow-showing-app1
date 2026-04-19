import { notFound } from "next/navigation";
import { LoadingLink } from "@/components/loading-link";
import { PreviewModeBanner } from "@/components/preview-mode-banner";
import { PropertyInterestForm } from "@/components/property-interest-form";
import { createPropertyInterest } from "@/lib/actions";
import { isPreviewReadonlyMode } from "@/lib/deployment";
import { getLeadById } from "@/lib/storage";

export default async function NewPropertyInterestPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lead = await getLeadById(id);

  if (!lead) {
    notFound();
  }

  const isPreviewReadonly = isPreviewReadonlyMode();

  return (
    <main className="space-y-6">
      {isPreviewReadonly ? <PreviewModeBanner /> : null}

      <section className="app-panel p-5 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="app-eyebrow">Add Property</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Add a listing to {lead.fullName}&apos;s shortlist
            </h1>
            <p className="app-copy mt-3">
              Track another property this customer is comparing so the record can capture rent,
              rating, pros, cons, neighborhood context, and next steps.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <LoadingLink href={`/leads/${lead.id}`} className="app-button-secondary">
              Back to Customer
            </LoadingLink>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="app-grid-card">
            <p className="app-kicker">Customer</p>
            <p className="mt-2 text-base font-semibold text-ink">{lead.fullName}</p>
          </div>
          <div className="app-grid-card">
            <p className="app-kicker">Primary Property</p>
            <p className="mt-2 text-base font-semibold text-ink">{lead.propertyAddress}</p>
          </div>
          <div className="app-grid-card">
            <p className="app-kicker">Tracked So Far</p>
            <p className="mt-2 text-base font-semibold text-ink">{lead.propertyInterests.length} properties</p>
          </div>
        </div>

        <div className="mt-8">
          <PropertyInterestForm
            action={createPropertyInterest}
            leadId={lead.id}
            submitLabel="Add Property"
            isPreviewReadonly={isPreviewReadonly}
          />
        </div>
      </section>
    </main>
  );
}
