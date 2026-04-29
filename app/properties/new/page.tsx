import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getLeadById, getLeads } from "@/lib/storage";

function getLeadIdFromReferer(referer: string) {
  if (!referer) {
    return "";
  }

  try {
    const url = new URL(referer);
    const match = url.pathname.match(/^\/leads\/([^/]+)/);
    return match?.[1] ? decodeURIComponent(match[1]) : "";
  } catch {
    return "";
  }
}

export default async function NewPropertyFallbackPage({
  searchParams
}: {
  searchParams?: { leadId?: string };
}) {
  const requestedLeadId = searchParams?.leadId || "";

  if (requestedLeadId && (await getLeadById(requestedLeadId))) {
    redirect(`/leads/${requestedLeadId}/properties/new`);
  }

  const refererLeadId = getLeadIdFromReferer(headers().get("referer") || "");

  if (refererLeadId && (await getLeadById(refererLeadId))) {
    redirect(`/leads/${refererLeadId}/properties/new`);
  }

  const [firstLead] = await getLeads();

  if (firstLead) {
    redirect(`/leads/${firstLead.id}/properties/new`);
  }

  redirect("/");
}
