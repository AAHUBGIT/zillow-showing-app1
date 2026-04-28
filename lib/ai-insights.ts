import { formatDateLabel, formatDateTimeLabel } from "./date";
import {
  getBedroomBathroomLabel,
  getBudgetLabel,
  getMoveInUrgencyLabel,
  getPreScreenStatus,
  getPropertyPreferenceFit,
  splitPreferenceList
} from "./client-preferences";
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
  const notePreferenceSignals = extractPreferences(
    [lead.notes, lead.agentNotes, lead.mustHaves, lead.dealBreakers, lead.preScreeningNotes].join(" ")
  );
  const preferenceHighlights = [
    ...getExplicitPreferenceHighlights(lead),
    ...notePreferenceSignals.map((signal) => signal.label)
  ].filter((value, index, values) => values.indexOf(value) === index);
  const recommendedProperty = getRecommendedProperty(lead, notePreferenceSignals);
  const nextAction = getSuggestedNextAction(lead, recommendedProperty);

  return {
    preferenceSummary: buildPreferenceSummary(lead),
    preferenceHighlights: preferenceHighlights.slice(0, 8),
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

function getExplicitPreferenceHighlights(lead: LeadWithProperties) {
  const highlights: string[] = [];
  const budget = getBudgetLabel(lead);
  const bedsBaths = getBedroomBathroomLabel(lead);
  const urgency = getMoveInUrgencyLabel(lead.moveInUrgency);
  const neighborhoods = splitPreferenceList(lead.preferredNeighborhoods);
  const mustHaves = splitPreferenceList(lead.mustHaves);

  if (budget !== "Budget not set") {
    highlights.push(budget);
  }

  if (bedsBaths !== "Beds/baths not set") {
    highlights.push(bedsBaths);
  }

  if (neighborhoods.length > 0) {
    highlights.push(`Neighborhoods: ${formatList(neighborhoods.slice(0, 2))}`);
  }

  if (urgency !== "Not set") {
    highlights.push(`Move-in: ${urgency}`);
  }

  if (mustHaves.length > 0) {
    highlights.push(`Must-haves: ${formatList(mustHaves.slice(0, 2))}`);
  }

  if (lead.applicationReady) {
    highlights.push("Application ready");
  }

  return highlights;
}

function buildPreferenceSummary(lead: LeadWithProperties) {
  const moveInLabel = lead.desiredMoveInDate ? formatDateLabel(lead.desiredMoveInDate) : "their target date";
  const budget = getBudgetLabel(lead);
  const bedsBaths = getBedroomBathroomLabel(lead);
  const neighborhoods = splitPreferenceList(lead.preferredNeighborhoods);
  const mustHaves = splitPreferenceList(lead.mustHaves);
  const dealBreakers = splitPreferenceList(lead.dealBreakers);
  const urgency = getMoveInUrgencyLabel(lead.moveInUrgency);
  const explicitPreferences = [
    budget !== "Budget not set" ? budget : "",
    bedsBaths !== "Beds/baths not set" ? bedsBaths : "",
    neighborhoods.length > 0 ? `neighborhoods near ${formatList(neighborhoods.slice(0, 3))}` : "",
    mustHaves.length > 0 ? `must-haves: ${formatList(mustHaves.slice(0, 3))}` : "",
    dealBreakers.length > 0 ? `dealbreakers: ${formatList(dealBreakers.slice(0, 3))}` : "",
    lead.pets ? `pets: ${lead.pets}` : "",
    urgency !== "Not set" ? `move-in urgency: ${urgency}` : ""
  ].filter((value): value is string => Boolean(value));
  const preScreenDetails = [
    getPreScreenStatus(lead),
    lead.applicationReady ? "application ready" : "",
    lead.creditConcern ? "credit needs review" : "",
    lead.hasGuarantor ? "guarantor available" : ""
  ].filter((value): value is string => Boolean(value));
  const preferenceSummary =
    explicitPreferences.length > 0
      ? `${lead.fullName} is looking for ${formatList(explicitPreferences.slice(0, 4))}.`
      : lead.notes
        ? `${lead.fullName}'s main preferences are captured in the current lead notes.`
        : `${lead.fullName} has not shared detailed preferences yet.`;

  return `${preferenceSummary} Pre-screen status: ${formatList(preScreenDetails)}. Current priority is ${getPriorityLabel(
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
      const fit = getPropertyPreferenceFit(propertyInterest, lead);

      let score = propertyInterest.rating * 12 + (statusBonus[normalizedStatus] || 0) + fit.score * 4;

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

      const strongestFit = fit.items.find((item) => item.status === "match");
      const fitConcern = fit.items.find((item) => item.status === "miss");
      const fitReview = fit.items.find((item) => item.status === "review");
      const fitReason = fitConcern
        ? `Preference review needed: ${fitConcern.detail}.`
        : strongestFit
          ? `Preference fit: ${strongestFit.detail}.`
          : fitReview
            ? `Needs confirmation: ${fitReview.detail}.`
            : `${fit.label} based on budget, bedrooms, neighborhood, and dealbreaker checks.`;
      const notePreferenceReason =
        matchedPreferences.length > 0
          ? `Matches ${formatList(matchedPreferences.slice(0, 2).map((preference) => preference.label))}.`
          : `Still aligns well with the lead's current shortlist.`;
      const reasons = [
        `${propertyInterest.rating}/5 client rating keeps it near the top.`,
        fitReason,
        notePreferenceReason,
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
    reason: `Best fit right now based on rating, status, and how closely it matches budget, bedrooms, neighborhood, must-haves, and dealbreakers.`,
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
  const mustHaves = splitPreferenceList(lead.mustHaves);
  const preferenceLine =
    mustHaves.length > 0
      ? `I kept ${formatList(mustHaves.slice(0, 3))} in mind while reviewing options.`
      : `I kept your budget and layout preferences in mind while reviewing options.`;

  if (lead.applicationReady && recommendedProperty) {
    const subject = `Application next step for ${recommendedPropertyName}`;
    const draft = `Hi ${firstName}, ${recommendedPropertyName} looks like the strongest fit based on your preferences. Since your application is ready, I recommend we confirm availability and move to the next application step today.`;

    return {
      type: "email",
      label: "Application step",
      reason: "The lead is marked application ready, so the best follow-up is a clear next-step email tied to the strongest property fit.",
      draft,
      href: `mailto:${lead.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(draft)}`
    };
  }

  if (!lead.incomeQualified || (lead.creditConcern && !lead.hasGuarantor)) {
    const draft = `Hi ${firstName}, I want to make sure I match you with the right options before scheduling more tours. Can you confirm your income range, any credit concerns, and whether a guarantor is available if needed?`;

    return {
      type: "text",
      label: "Pre-screen follow-up",
      reason: "Qualification details need review before investing more time in showings.",
      draft,
      href: `sms:${lead.phone}?body=${encodeURIComponent(draft)}`
    };
  }

  if (lead.status === "new" || lead.priority === "urgent" || followUpState === "overdue") {
    const urgencyLabel = getMoveInUrgencyLabel(lead.moveInUrgency);
    const draft = `Hi ${firstName}, this is your leasing team checking in about ${recommendedPropertyName}. I wanted to confirm your top priorities and help lock in the best next step for your move-in around ${formatDateLabel(
      lead.desiredMoveInDate
    )}${urgencyLabel !== "Not set" ? ` (${urgencyLabel})` : ""}.`;

    return {
      type: "call",
      label: "Call recommended",
      reason: "A live call is the fastest way to move an urgent, new, or overdue lead forward while confirming preferences.",
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
  const draft = `Hi ${firstName}, I reviewed your current shortlist and ${recommendedPropertyName} looks like the strongest fit so far. ${preferenceLine} Based on your priorities, I recommend that we confirm your next tour or application step this week.`;

  return {
    type: "email",
    label: "Email recommended",
    reason: "An email recap works well when the lead needs a preference-based property recommendation and a clear written next step.",
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
