import { NewLeadForm } from "@/components/new-lead-form";
import { PreviewModeBanner } from "@/components/preview-mode-banner";
import { isPreviewReadonlyMode } from "@/lib/deployment";
import { getPropertyListings } from "@/lib/property-listings";

export default async function NewLeadPage() {
  const isPreviewReadonly = isPreviewReadonlyMode();
  const propertyListings = await getPropertyListings();

  return (
    <main className="space-y-4">
      {isPreviewReadonly ? <PreviewModeBanner /> : null}

      <section className="app-panel p-4 sm:p-5">
        <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr] xl:items-end">
          <div className="max-w-3xl">
            <p className="app-eyebrow">New Lead</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Add a renter lead
            </h2>
            <p className="app-copy mt-2">
              Fill out the basics below. You can add a showing schedule right away or leave it for
              the details page later.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="app-grid-card p-4">
              <p className="app-kicker">Workflow</p>
              <p className="mt-2 text-base font-semibold text-ink">Create a new CRM record</p>
            </div>
            <div className="app-grid-card p-4">
              <p className="app-kicker">Optional</p>
              <p className="mt-2 text-base font-semibold text-ink">Add showing details now or later</p>
            </div>
          </div>
        </div>

        <NewLeadForm isPreviewReadonly={isPreviewReadonly} propertyListings={propertyListings} />
      </section>
    </main>
  );
}
