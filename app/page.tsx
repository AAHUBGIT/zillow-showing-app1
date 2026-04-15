import { DashboardClient } from "@/components/dashboard-client";
import { isPreviewReadonlyMode } from "@/lib/deployment";
import { getLeads } from "@/lib/storage";

export default async function DashboardPage() {
  const leads = await getLeads();
  return <DashboardClient leads={leads} isPreviewReadonly={isPreviewReadonlyMode()} />;
}
