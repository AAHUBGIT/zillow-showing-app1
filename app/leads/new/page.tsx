import { NewLeadForm } from "@/components/new-lead-form";
import { PreviewModeBanner } from "@/components/preview-mode-banner";
import { isPreviewReadonlyMode } from "@/lib/deployment";

export default function NewLeadPage() {
  const isPreviewReadonly = isPreviewReadonlyMode();

  return (
    <main className="space-y-6">
      {isPreviewReadonly ? <PreviewModeBanner /> : null}

      <section className="app-panel p-5 sm:p-6">
        <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr] xl:items-end">
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="app-grid-card">
              <p className="app-kicker">Workflow</p>
              <p className="mt-2 text-base font-semibold text-ink">Create a new CRM record</p>
            </div>
            <div className="app-grid-card">
              <p className="app-kicker">Optional</p>
              <p className="mt-2 text-base font-semibold text-ink">Add showing details now or later</p>
            </div>
          </div>
        </div>

        <NewLeadForm isPreviewReadonly={isPreviewReadonly} />
      </section>
    </main>
  );
}
