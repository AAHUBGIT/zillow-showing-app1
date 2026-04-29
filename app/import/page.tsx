import { LeadImportWorkflow } from "@/components/lead-import-workflow";
import { PreviewModeBanner } from "@/components/preview-mode-banner";
import { isPreviewReadonlyMode } from "@/lib/deployment";
import { getLeads } from "@/lib/storage";

export default async function ImportLeadPage() {
  const leads = await getLeads();
  const isPreviewReadonly = isPreviewReadonlyMode();
  const duplicateLeads = leads.map((lead) => ({
    id: lead.id,
    fullName: lead.fullName,
    phone: lead.phone,
    email: lead.email,
    propertyAddress: lead.propertyAddress
  }));

  return (
    <main className="space-y-6">
      {isPreviewReadonly ? <PreviewModeBanner /> : null}

      <section className="app-panel p-5 sm:p-6">
        <p className="app-eyebrow">Import</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Import lead
        </h1>
        <p className="app-copy mt-3 max-w-3xl">
          Paste a Zillow, email, or portal inquiry and review the parsed details before saving.
        </p>
      </section>

      <LeadImportWorkflow duplicateLeads={duplicateLeads} isPreviewReadonly={isPreviewReadonly} />
    </main>
  );
}
