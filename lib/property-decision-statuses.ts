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

export const defaultPropertyDecisionStatuses: PropertyDecisionStatusConfig[] = [
  {
    value: "interested",
    label: "Interested",
    tone: "blue",
    className: "border-blue-200 bg-blue-50 text-blue-700",
    order: 10,
    isActive: true
  },
  {
    value: "liked",
    label: "Liked",
    tone: "emerald",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    order: 20,
    isActive: true
  },
  {
    value: "maybe",
    label: "Maybe",
    tone: "amber",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    order: 30,
    isActive: true
  },
  {
    value: "rejected",
    label: "Rejected",
    tone: "rose",
    className: "border-rose-200 bg-rose-50 text-rose-700",
    order: 40,
    isActive: true,
    isTerminal: true
  },
  {
    value: "applying",
    label: "Applying",
    tone: "purple",
    className: "border-purple-200 bg-purple-50 text-purple-700",
    order: 50,
    isActive: true,
    isApplying: true
  },
  {
    value: "backup",
    label: "Backup",
    tone: "slate",
    className: "border-slate-200 bg-slate-100 text-slate-700",
    order: 60,
    isActive: true
  },
  {
    value: "needs_second_look",
    label: "Needs second look",
    tone: "orange",
    className: "border-orange-200 bg-orange-50 text-orange-700",
    order: 70,
    isActive: true
  }
];

const legacyWorkflowStatuses: PropertyDecisionStatusConfig[] = [
  {
    value: "scheduled",
    label: "Scheduled",
    tone: "indigo",
    className: "border-indigo-200 bg-indigo-50 text-indigo-700",
    order: 15,
    isActive: true,
    isLegacyWorkflow: true
  },
  {
    value: "toured",
    label: "Toured",
    tone: "emerald",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
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
    className: "border-slate-200 bg-slate-100 text-slate-700",
    order: 80,
    isActive: false,
    isTerminal: true,
    isLegacyWorkflow: true
  }
];

const decisionStatuses = [...defaultPropertyDecisionStatuses, ...legacyWorkflowStatuses];
const statusMap = new Map(decisionStatuses.map((status) => [status.value, status]));

export function getDecisionStatusOptions() {
  return defaultPropertyDecisionStatuses.filter((status) => status.isActive);
}

export function getAllDecisionStatusOptions() {
  return decisionStatuses;
}

export function normalizeDecisionStatus(value: string): PropertyInterestStatus {
  return statusMap.has(value as PropertyInterestStatus)
    ? (value as PropertyInterestStatus)
    : "interested";
}

export function getDecisionStatusConfig(value: string) {
  return statusMap.get(normalizeDecisionStatus(value)) || defaultPropertyDecisionStatuses[0];
}

export function getDecisionStatusLabel(value: string) {
  return getDecisionStatusConfig(value).label;
}

export function getDecisionStatusTone(value: string) {
  return getDecisionStatusConfig(value).className;
}

export function getDecisionStatusOrder(value: string) {
  return getDecisionStatusConfig(value).order;
}

export function isDecisionStatusTerminal(value: string) {
  return Boolean(getDecisionStatusConfig(value).isTerminal);
}

export function isDecisionStatusApplying(value: string) {
  return Boolean(getDecisionStatusConfig(value).isApplying);
}

export function isDefaultDecisionStatus(value: string) {
  return getDecisionStatusOptions().some((status) => status.value === value);
}

export function groupPropertyInterestsByDecisionStatus<
  T extends Pick<PropertyInterest, "status">
>(interests: T[]) {
  return getAllDecisionStatusOptions()
    .sort((first, second) => first.order - second.order)
    .map((config) => ({
      status: config.value,
      config,
      interests: interests.filter(
        (interest) => normalizeDecisionStatus(interest.status) === config.value
      )
    }));
}
