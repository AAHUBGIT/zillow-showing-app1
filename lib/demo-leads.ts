import leads from "@/data/leads.json";
import { withClientPreferenceDefaults } from "./client-preferences";
import { syncLeadShowingToPropertyInterests } from "./property-interest-utils";
import { withShowingLifecycleDefaults } from "./showing-lifecycle";
import { LeadWithProperties } from "./types";

const demoSchedulePresets: Record<
  string,
  {
    showingOffset?: number;
    showingTime?: string;
    followUpOffset?: number;
    status?: LeadWithProperties["status"];
    routeStopOrder?: number;
  }
> = {
  "lead-1": {
    showingOffset: 0,
    showingTime: "10:00",
    followUpOffset: 0,
    status: "scheduled",
    routeStopOrder: 1
  },
  "lead-2": {
    followUpOffset: -1,
    status: "contacted"
  },
  "lead-3": {
    showingOffset: 1,
    showingTime: "11:30",
    followUpOffset: 1,
    status: "scheduled",
    routeStopOrder: 1
  },
  "lead-4": {
    showingOffset: 3,
    showingTime: "13:30",
    followUpOffset: 2,
    status: "scheduled",
    routeStopOrder: 1
  },
  "lead-5": {
    showingOffset: 5,
    showingTime: "09:15",
    status: "scheduled",
    routeStopOrder: 1
  }
};

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(offset: number) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return toIsoDate(date);
}

function relativeTimestamp(offset: number, hour = 14) {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return date.toISOString();
}

function getFallbackShowingOffset(index: number) {
  return [7, 10, 14, 21][index % 4];
}

function getFallbackFollowUpOffset(index: number) {
  return [-2, 0, 1, 3, 5][index % 5];
}

function withFreshDemoDates(lead: LeadWithProperties, index: number): LeadWithProperties {
  const preset = demoSchedulePresets[lead.id];
  const isClosed = lead.status === "closed" || preset?.status === "closed";
  const hasOriginalShowing = Boolean(lead.showingDate && lead.showingTime);
  const showingOffset =
    preset?.showingOffset ??
    (hasOriginalShowing ? (isClosed ? -3 : getFallbackShowingOffset(index)) : undefined);
  const showingDate = showingOffset === undefined ? "" : addDays(showingOffset);
  const showingTime =
    showingOffset === undefined ? "" : preset?.showingTime || lead.showingTime || "10:00";
  const followUpOffset =
    preset?.followUpOffset ??
    (isClosed ? undefined : lead.nextFollowUpDate ? getFallbackFollowUpOffset(index) : undefined);
  const nextFollowUpDate = followUpOffset === undefined ? "" : addDays(followUpOffset);
  const status =
    preset?.status ||
    (showingDate && showingTime && lead.status !== "closed" ? "scheduled" : lead.status);

  return {
    ...lead,
    desiredMoveInDate: lead.desiredMoveInDate ? addDays(14 + index * 2) : "",
    nextFollowUpDate,
    showingDate,
    showingTime,
    status,
    showingStatus: showingDate && showingTime ? lead.showingStatus || "scheduled" : "",
    showingOutcome: lead.showingOutcome || "",
    showingOutcomeNotes: lead.showingOutcomeNotes || "",
    showingCompletedAt: lead.showingCompletedAt || "",
    showingCanceledReason: lead.showingCanceledReason || "",
    routeStopOrder: showingDate && showingTime ? preset?.routeStopOrder || 1 : 0,
    routeCompleted: showingOffset !== undefined && showingOffset < 0 ? lead.routeCompleted : false,
    createdAt: relativeTimestamp(-10 - index, 10),
    updatedAt: relativeTimestamp(-index, 15),
    propertyInterests: (lead.propertyInterests || []).map((propertyInterest, propertyIndex) => ({
      ...propertyInterest,
      createdAt: relativeTimestamp(-10 - index - propertyIndex, 11),
      updatedAt: relativeTimestamp(-index, 16)
    }))
  };
}

export function getDemoLeads() {
  return [...(leads as LeadWithProperties[])]
    .map((lead, index) => {
      const freshLead = withFreshDemoDates(lead, index);

      return withShowingLifecycleDefaults(
        withClientPreferenceDefaults({
          ...freshLead,
          userId: lead.userId || "demo-user",
          routeStopOrder: Number(freshLead.routeStopOrder || 0),
          routeCompleted: Boolean(freshLead.routeCompleted || false),
          routeNote: freshLead.routeNote || "",
          propertyInterests: syncLeadShowingToPropertyInterests(
            freshLead.propertyInterests || [],
            freshLead.propertyAddress,
            freshLead.showingDate,
            freshLead.showingTime
          )
        })
      );
    })
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}
