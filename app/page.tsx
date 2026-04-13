import { DashboardClient } from "@/components/dashboard-client";
import { getLeads } from "@/lib/storage";

export default async function DashboardPage() {
  const leads = await getLeads();
  return <DashboardClient leads={leads} />;
}
