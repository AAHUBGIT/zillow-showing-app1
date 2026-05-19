import { DashboardClient } from "@/components/dashboard-client";
import { getSessionUser } from "@/lib/auth";
import { isPreviewReadonlyMode } from "@/lib/deployment";
import { getLeads } from "@/lib/storage";
import { getWorkflowSettingsForUser } from "@/lib/workflow-settings";

export default async function DashboardPage() {
  const [leads, sessionUser] = await Promise.all([getLeads(), getSessionUser()]);
  const workflowSettings = await getWorkflowSettingsForUser(sessionUser?.id);

  return (
    <DashboardClient
      leads={leads}
      defaultNextFollowUpOption={workflowSettings.defaultFollowUpOption}
      decisionStatuses={workflowSettings.decisionStatuses}
      isPreviewReadonly={isPreviewReadonlyMode()}
    />
  );
}
