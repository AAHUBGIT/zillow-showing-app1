import { redirect } from "next/navigation";
import { PreviewModeBanner } from "@/components/preview-mode-banner";
import { WorkflowSettingsForm } from "@/components/workflow-settings-form";
import { getSessionUser } from "@/lib/auth";
import { isPreviewReadonlyMode } from "@/lib/deployment";
import { getWorkflowSettingsForUser } from "@/lib/workflow-settings";

export default async function WorkflowSettingsPage() {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect("/login");
  }

  const settings = await getWorkflowSettingsForUser(sessionUser.id);
  const isPreviewReadonly = isPreviewReadonlyMode();

  return (
    <main className="space-y-5">
      {isPreviewReadonly ? <PreviewModeBanner /> : null}

      <section className="app-panel p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="app-eyebrow">Settings</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Workflow Settings
            </h1>
            <p className="app-copy mt-2 max-w-3xl">
              Customize the small workflow defaults agents touch every day: property decisions,
              follow-up timing, density, landing behavior, and beta visibility.
            </p>
          </div>
          <span className="app-chip">Workspace defaults</span>
        </div>
      </section>

      <WorkflowSettingsForm settings={settings} />
    </main>
  );
}
