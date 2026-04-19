import { formatDateLabel, formatDateTimeLabel } from "./date";
import {
  getFollowUpState,
  getPriorityLabel,
  getSourceLabel,
  getStatusLabel
} from "./lead-utils";
import {
  getPropertyInterestStatusLabel,
  isActivePropertyInterest,
  normalizePropertyInterestStatus
} from "./property-interest-utils";
import { LeadWithProperties, PropertyInterest } from "./types";

type PreferenceSignal = {
  label: string;
  keywords: string[];
};

type SuggestedActionType = "call" | "text" | "email";

export type LeadAiInsights = {
  preferenceSummary: string;
  preferenceHighlights: string[];
  nextAction: {
    type: SuggestedActionType;
    label: string;
    reason: string;
    draft: string;
    href: string;
  };
  recommendedProperty: {
    property: PropertyInterest;
    reason: string;
    reasons: string[];
    confidenceLabel: string;
  } | null;
};

const preferenceSignals: PreferenceSignal[] = [
  { label: "in-unit laundry", keywords: ["laundry"] },
  { label: "natural light", keywords: ["natural light"] },
  { label: "gym access", keywords: ["gym", "fitness"] },
  { label: "parking", keywords: ["parking", "garage", "covered parking", "guest parking"] },
  { label: "pet-friendly options", keywords: ["pet", "pet-friendly"] },
  { label: "storage", keywords: ["storage", "closet"] },
  { label: "furnished options", keywords: ["furnished"] },
  { label: "walkability", keywords: ["walkable", "walkability"] },
  { label: "commute convenience", keywords: ["commute", "close to work", "close to office"] },
  { label: "waterfront access", keywords: ["waterfront", "harbor", "water view"] },
  { label: "concierge service", keywords: ["concierge"] },
  { label: "quiet surroundings", keywords: ["quiet", "quieter"] },
  { label: "short lease flexibility", keywords: ["shorter lease", "short-term", "flex lease"] }
];

const positiveFeedbackSignals = ["love", "loved", "winner", "top", "strong fit", "best", "favorite"];
const negativeFeedbackSignals = ["too expensive", "tight", "small", "weaker", "passed", "backup"];

const statusBonus: Record<string, number> = {
  applying: 10,
  approved: 9,
  scheduled: 8,
  toured: 6,
  interested: 4,
  rejected: -20
};

export function getLeadAiInsights(lead: LeadWithProperties): LeadAiInsights {
  const preferenceSignals = extractPreferences([lead.notes, lead.agentNotes].join(" "));
  const recommendedProperty = getRecommendedProperty(lead, preferenceSignals);
  const nextAction = getSuggestedNextAction(lead, recommendedProperty);

  return {
    preferenceSummary: buildPreferenceSummary(
      lead,
      preferenceSignals.map((signal) => signal.label)
    ),
    preferenceHighlights: preferenceSignals.map((signal) => signal.label),
    nextAction,
    recommendedProperty
  };
}

function extractPreferences(text: string) {
  const haystack = text.toLowerCase();

  return preferenceSignals
    .filter((signal) => signal.keywords.some((keyword) => haystack.includes(keyword)))
    .slice(0, 5);
}

function buildPreferenceSummary(lead: LeadWithProperties, preferences: string[]) {
  const moveInLabel = lead.desiredMoveInDate ? formatDateLabel(lead.desiredMoveInDate) : "their target date";
  const preferenceSummary =
    preferences.length > 0
      ? `${lead.fullName} is focused on ${formatList(preferences.slice(0, 3))}.`
      : lead.notes
        ? `${lead.fullName}'s main preferences are captured in the current lead notes.`
        : `${lead.fullName} has not shared detailed preferences yet.`;

  return `${preferenceSummary} Current priority is ${getPriorityLabel(
    lead.priority
  ).toLowerCase()}, move-in target is ${moveInLabel}, and the lead is ${getStatusLabel(
    lead.status
  ).toLowerCase()} from ${getSourceLabel(lead.source)}.`;
}

function getRecommendedProperty(
  lead: LeadWithProperties,
  preferences: PreferenceSignal[]
): LeadAiInsights["recommendedProperty"] {
  const activeProperties = lead.propertyInterests.filter(isActivePropertyInterest);
  const candidates = activeProperties.length > 0 ? activeProperties : lead.propertyInterests;

  if (candidates.length === 0) {
    return null;
  }

  const ranked = candidates
    .map((propertyInterest) => {
      const normalizedStatus = normalizePropertyInterestStatus(propertyInterest.status);
      const searchText = [
        propertyInterest.listingTitle,
        propertyInterest.address,
        propertyInterest.neighborhood,
        propertyInterest.pros,
        propertyInterest.clientFeedback,
        propertyInterest.agentNotes
      ]
        .join(" ")
        .toLowerCase();
      const consText = propertyInterest.cons.toLowerCase();
      const matchedPreferences = preferences.filter((preference) =>
        preference.keywords.some((keyword) => searchText.includes(keyword))
      );
      const blockedPreferences = preferences.filter((preference) =>
        preference.keywords.some((keyword) => consText.includes(keyword))
      );

      let score = propertyInterest.rating * 12 + (statusBonus[normalizedStatus] || 0);

      if (propertyInterest.address === lead.propertyAddress) {
        score += 5;
      }

      score += matchedPreferences.length * 5;
      score -= blockedPreferences.length * 3;

      if (positiveFeedbackSignals.some((signal) => searchText.includes(signal))) {
        score += 3;
      }

      if (negativeFeedbackSignals.some((signal) => consText.includes(signal))) {
        score -= 2;
      }

      const reasons = [
        `${propertyInterest.rating}/5 client rating keeps it near the top.`,
        matchedPreferences.length > 0
          ? `Matches ${formatList(matchedPreferences.slice(0, 2).map((preference) => preference.label))}.`
          : `Still aligns well with the lead's current shortlist.`,
        `${getPropertyInterestStatusLabel(propertyInterest.status)} status means the lead is already making progress here.`
      ];

      return {
        property: propertyInterest,
        score,
        reasons
      };
    })
    .sort((first, second) => second.score - first.score);

  const best = ranked[0];

  return {
    property: best.property,
    reason: `Best fit right now based on rating, status, and how closely it matches the lead's stated preferences.`,
    reasons: best.reasons,
    confidenceLabel:
      best.score >= 65 ? "High confidence" : best.score >= 48 ? "Good fit" : "Worth reviewing"
  };
}

function getSuggestedNextAction(
  lead: LeadWithProperties,
  recommendedProperty: LeadAiInsights["recommendedProperty"]
): LeadAiInsights["nextAction"] {
  const firstName = lead.fullName.split(" ")[0] || lead.fullName;
  const followUpState = getFollowUpState(lead.nextFollowUpDate);
  const recommendedPropertyName =
    recommendedProperty?.property.listingTitle || lead.propertyAddress || "the current shortlist";

  if (lead.status === "new" || lead.priority === "urgent" || followUpState === "overdue") {
    const draft = `Hi ${firstName}, this is your leasing team checking in about ${recommendedPropertyName}. I wanted to confirm your top priorities and help lock in the best next step for your move-in around ${formatDateLabel(
      lead.desiredMoveInDate
    )}.`;

    return {
      type: "call",
      label: "Call recommended",
      reason: "A live call is the fastest way to move an urgent, new, or overdue lead forward.",
      draft,
      href: `tel:${lead.phone}`
    };
  }

  if (lead.showingDate && lead.showingTime) {
    const draft = `Hi ${firstName}, looking forward to your showing for ${lead.propertyAddress} on ${formatDateTimeLabel(
      lead.showingDate,
      lead.showingTime
    )}. Reply here if you want me to add anything specific to the tour plan.`;

    return {
      type: "text",
      label: "Text recommended",
      reason: "A short text works best for confirming an upcoming showing and keeping momentum high.",
      draft,
      href: `sms:${lead.phone}?body=${encodeURIComponent(draft)}`
    };
  }

  const subject = `Next steps for ${recommendedPropertyName}`;
  const draft = `Hi ${firstName}, I reviewed your current shortlist and ${recommendedPropertyName} looks like the strongest fit so far. Based on your priorities, I would recommend that we confirm your next tour or application step this week. Let me know if you want me to send over updated options or schedule the next showing.`;

  return {
    type: "email",
    label: "Email recommended",
    reason: "An email recap works well when the lead needs a clear written next step and property recommendation.",
    draft,
    href: `mailto:${lead.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(draft)}`
  };
}

function formatList(items: string[]) {
  if (items.length === 0) {
    return "";
  }

  if (items.length === 1) {
    return items[0];
  }

  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }

  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}
