import type { PropertyInterest, PropertyInterestStatus } from "./types";

export type PropertyDecisionTone =
  | "blue"
  | "emerald"
  | "amber"
  | "rose"
  | "purple"
  | "slate"
  | "orange"
  | "indigo";

export type PropertyDecisionStatusConfig = {
  value: PropertyInterestStatus;
  label: string;
  tone: PropertyDecisionTone;
  className: string;
  order: number;
  isActive: boolean;
  isTerminal?: boolean;
  isApplying?: boolean;
  isLegacyWorkflow?: boolean;
};

export const propertyDecisionToneClasses: Record<PropertyDecisionTone, string> = {
  blue: "border-blue-200 bg-blue-50 text-blue-700",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  rose: "border-rose-200 bg-rose-50 text-rose-700",
  purple: "border-purple-200 bg-purple-50 text-purple-700",
  slate: "border-slate-200 bg-slate-100 text-slate-700",
  orange: "border-orange-200 bg-orange-50 text-orange-700",
  indigo: "border-indigo-200 bg-indigo-50 text-indigo-700"
};

export const propertyDecisionToneOptions: Array<{ value: PropertyDecisionTone; label: string }> = [
  { value: "blue", label: "Blue" },
  { value: "emerald", label: "Emerald" },
  { value: "amber", label: "Amber" },
  { value: "rose", label: "Rose" },
  { value: "purple", label: "Purple" },
  { value: "slate", label: "Slate" },
  { value: "orange", label: "Orange" },
  { value: "indigo", label: "Indigo" }
];

export function getDecisionToneClassName(tone: string): string {
  return propertyDecisionToneClasses[normalizeDecisionTone(tone)];
}

export function normalizeDecisionTone(tone: string): PropertyDecisionTone {
  return propertyDecisionToneOptions.some((option) => option.value === tone)
    ? (tone as PropertyDecisionTone)
    : "slate";
}

export const defaultPropertyDecisionStatuses: PropertyDecisionStatusConfig[] = [
  {
    value: "interested",
    label: "Interested",
    tone: "blue",
    className: propertyDecisionToneClasses.blue,
    order: 10,
    isActive: true
  },
  {
    value: "liked",
    label: "Liked",
    tone: "emerald",
    className: propertyDecisionToneClasses.emerald,
    order: 20,
    isActive: true
  },
  {
    value: "maybe",
    label: "Maybe",
    tone: "amber",
    className: propertyDecisionToneClasses.amber,
    order: 30,
    isActive: true
  },
  {
    value: "rejected",
    label: "Rejected",
    tone: "rose",
    className: propertyDecisionToneClasses.rose,
    order: 40,
    isActive: true,
    isTerminal: true
  },
  {
    value: "applying",
    label: "Applying",
    tone: "purple",
    className: propertyDecisionToneClasses.purple,
    order: 50,
    isActive: true,
    isApplying: true
  },
  {
    value: "backup",
    label: "Backup",
    tone: "slate",
    className: propertyDecisionToneClasses.slate,
    order: 60,
    isActive: true
  },
  {
    value: "needs_second_look",
    label: "Needs second look",
    tone: "orange",
    className: propertyDecisionToneClasses.orange,
    order: 70,
    isActive: true
  }
];

const legacyWorkflowStatuses: PropertyDecisionStatusConfig[] = [
  {
    value: "scheduled",
    label: "Scheduled",
    tone: "indigo",
    className: propertyDecisionToneClasses.indigo,
    order: 15,
    isActive: true,
    isLegacyWorkflow: true
  },
  {
    value: "toured",
    label: "Toured",
    tone: "emerald",
    className: propertyDecisionToneClasses.emerald,
    order: 25,
    isActive: true,
    isLegacyWorkflow: true
  },
  {
    value: "approved",
    label: "Approved",
    tone: "emerald",
    className: "border-emerald-300 bg-emerald-100 text-emerald-800",
    order: 55,
    isActive: true,
    isApplying: true,
    isLegacyWorkflow: true
  },
  {
    value: "closed",
    label: "Closed",
    tone: "slate",
    className: propertyDecisionToneClasses.slate,
    order: 80,
    isActive: false,
    isTerminal: true,
    isLegacyWorkflow: true
  }
];

const fallbackDecisionStatuses = [...defaultPropertyDecisionStatuses, ...legacyWorkflowStatuses];

function humanizeStatusValue(value: string) {
  return value
    .split(/[_\-\s]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ") || "Interested";
}

function buildUnknownStatusConfig(value: string): PropertyDecisionStatusConfig {
  return {
    value: value as PropertyInterestStatus,
    label: humanizeStatusValue(value),
    tone: "slate",
    className: propertyDecisionToneClasses.slate,
    order: 999,
    isActive: false
  };
}

function normalizeStatusConfig(config: PropertyDecisionStatusConfig): PropertyDecisionStatusConfig {
  const tone = normalizeDecisionTone(config.tone);

  return {
    ...config,
    label: config.label.trim() || humanizeStatusValue(config.value),
    tone,
    className: getDecisionToneClassName(tone),
    order: Number.isFinite(config.order) ? config.order : 999,
    isActive: Boolean(config.isActive)
  };
}

export function getAllDecisionStatusOptions(statuses?: PropertyDecisionStatusConfig[]) {
  const configured = statuses?.length ? statuses : defaultPropertyDecisionStatuses;
  const statusMap = new Map<PropertyInterestStatus, PropertyDecisionStatusConfig>();

  for (const status of configured.map(normalizeStatusConfig)) {
    statusMap.set(status.value, status);
  }

  for (const legacyStatus of legacyWorkflowStatuses) {
    if (!statusMap.has(legacyStatus.value)) {
      statusMap.set(legacyStatus.value, legacyStatus);
    }
  }

  return Array.from(statusMap.values()).sort((first, second) => first.order - second.order);
}

export function getDecisionStatusOptions(statuses?: PropertyDecisionStatusConfig[]) {
  return getAllDecisionStatusOptions(statuses).filter(
    (status) => status.isActive && !status.isLegacyWorkflow
  );
}

export function normalizeDecisionStatus(
  value: string,
  statuses?: PropertyDecisionStatusConfig[]
): PropertyInterestStatus {
  const normalizedValue = value.trim() as PropertyInterestStatus;

  if (!normalizedValue) {
    return "interested";
  }

  return normalizedValue;
}

export function getDecisionStatusConfig(
  value: string,
  statuses?: PropertyDecisionStatusConfig[]
) {
  const normalizedValue = normalizeDecisionStatus(value, statuses);
  const configuredStatus = getAllDecisionStatusOptions(statuses).find(
    (status) => status.value === normalizedValue
  );

  return configuredStatus || buildUnknownStatusConfig(normalizedValue);
}

export function getDecisionStatusLabel(value: string, statuses?: PropertyDecisionStatusConfig[]) {
  return getDecisionStatusConfig(value, statuses).label;
}

export function getDecisionStatusTone(value: string, statuses?: PropertyDecisionStatusConfig[]) {
  return getDecisionStatusConfig(value, statuses).className;
}

export function getDecisionStatusOrder(value: string, statuses?: PropertyDecisionStatusConfig[]) {
  return getDecisionStatusConfig(value, statuses).order;
}

export function isDecisionStatusTerminal(value: string, statuses?: PropertyDecisionStatusConfig[]) {
  return Boolean(getDecisionStatusConfig(value, statuses).isTerminal);
}

export function isDecisionStatusApplying(value: string, statuses?: PropertyDecisionStatusConfig[]) {
  return Boolean(getDecisionStatusConfig(value, statuses).isApplying);
}

export function isDefaultDecisionStatus(value: string, statuses?: PropertyDecisionStatusConfig[]) {
  return getDecisionStatusOptions(statuses).some((status) => status.value === value);
}

export function groupPropertyInterestsByDecisionStatus<
  T extends Pick<PropertyInterest, "status">
>(interests: T[], statuses?: PropertyDecisionStatusConfig[]) {
  const knownGroups = getAllDecisionStatusOptions(statuses).map((config) => ({
    status: config.value,
    config,
    interests: interests.filter(
      (interest) => normalizeDecisionStatus(interest.status, statuses) === config.value
    )
  }));

  const knownValues = new Set(knownGroups.map((group) => group.status));
  const unknownGroups = Array.from(
    new Set(interests.map((interest) => normalizeDecisionStatus(interest.status, statuses)))
  )
    .filter((status) => !knownValues.has(status))
    .map((status) => {
      const config = buildUnknownStatusConfig(status);

      return {
        status,
        config,
        interests: interests.filter(
          (interest) => normalizeDecisionStatus(interest.status, statuses) === status
        )
      };
    });

  return [...knownGroups, ...unknownGroups].sort(
    (first, second) => first.config.order - second.config.order
  );
}

export function getDefaultWorkflowDecisionStatuses() {
  return defaultPropertyDecisionStatuses.map((status) => ({ ...status }));
}

export function getFallbackDecisionStatuses() {
  return fallbackDecisionStatuses.map((status) => ({ ...status }));
}
