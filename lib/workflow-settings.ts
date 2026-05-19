import { canUseDatabase, shouldUseDemoData } from "./deployment";
import { getPrismaClient } from "./prisma";
import {
  defaultPropertyDecisionStatuses,
  getDecisionToneClassName,
  normalizeDecisionTone,
  type PropertyDecisionStatusConfig,
  type PropertyDecisionTone
} from "./property-decision-statuses";
import type { PropertyInterestStatus } from "./types";

export type FollowUpDefaultOption = "tomorrow" | "two_days" | "next_week" | "none";
export type WorkflowDefaultDensity = "compact" | "comfortable";
export type WorkflowDefaultLandingPage = "dashboard" | "today" | "routes" | "properties";

export type WorkflowSettingsView = {
  decisionStatuses: PropertyDecisionStatusConfig[];
  defaultFollowUpOption: FollowUpDefaultOption;
  defaultDensity: WorkflowDefaultDensity;
  defaultLandingPage: WorkflowDefaultLandingPage;
  hideLeadCaptureBeta: boolean;
};

export const followUpDefaultOptions: Array<{ value: FollowUpDefaultOption; label: string }> = [
  { value: "tomorrow", label: "Tomorrow" },
  { value: "two_days", label: "In 2 days" },
  { value: "next_week", label: "Next week" },
  { value: "none", label: "No default" }
];

export const workflowDensityOptions: Array<{ value: WorkflowDefaultDensity; label: string }> = [
  { value: "compact", label: "Compact" },
  { value: "comfortable", label: "Comfort" }
];

export const workflowLandingPageOptions: Array<{ value: WorkflowDefaultLandingPage; label: string }> = [
  { value: "dashboard", label: "Dashboard" },
  { value: "today", label: "Today" },
  { value: "routes", label: "Routes" },
  { value: "properties", label: "Properties" }
];

export const defaultWorkflowSettings: WorkflowSettingsView = {
  decisionStatuses: defaultPropertyDecisionStatuses.map((status) => ({ ...status })),
  defaultFollowUpOption: "tomorrow",
  defaultDensity: "compact",
  defaultLandingPage: "dashboard",
  hideLeadCaptureBeta: false
};

export function createStatusSlug(label: string) {
  return label
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);
}

function normalizeWorkflowDecisionStatus(input: Partial<PropertyDecisionStatusConfig>, orderFallback: number) {
  const value = String(input.value || "").trim() as PropertyInterestStatus;
  const label = String(input.label || "").trim();
  const tone = normalizeDecisionTone(String(input.tone || ""));

  if (!value || !label) {
    return null;
  }

  return {
    value,
    label: label.slice(0, 60),
    tone,
    className: getDecisionToneClassName(tone),
    order: Number.isFinite(input.order) ? Number(input.order) : orderFallback,
    isActive: input.isActive !== false,
    isTerminal: Boolean(input.isTerminal),
    isApplying: Boolean(input.isApplying)
  } satisfies PropertyDecisionStatusConfig;
}

export function parseDecisionStatusesJson(value: string | null | undefined) {
  if (!value) {
    return defaultWorkflowSettings.decisionStatuses;
  }

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return defaultWorkflowSettings.decisionStatuses;
    }

    return mergeDecisionStatuses(
      parsed
        .map((status, index) => normalizeWorkflowDecisionStatus(status, (index + 1) * 10))
        .filter(Boolean) as PropertyDecisionStatusConfig[]
    );
  } catch {
    return defaultWorkflowSettings.decisionStatuses;
  }
}

export function serializeDecisionStatuses(statuses: PropertyDecisionStatusConfig[]) {
  return JSON.stringify(
    statuses.map((status, index) => ({
      value: status.value,
      label: status.label,
      tone: status.tone,
      order: status.order || (index + 1) * 10,
      isActive: status.isActive !== false,
      isTerminal: Boolean(status.isTerminal),
      isApplying: Boolean(status.isApplying)
    }))
  );
}

export function mergeDecisionStatuses(statuses: PropertyDecisionStatusConfig[]) {
  const statusMap = new Map<PropertyInterestStatus, PropertyDecisionStatusConfig>();

  for (const status of statuses) {
    statusMap.set(status.value, status);
  }

  for (const defaultStatus of defaultPropertyDecisionStatuses) {
    if (!statusMap.has(defaultStatus.value)) {
      statusMap.set(defaultStatus.value, { ...defaultStatus });
    }
  }

  return Array.from(statusMap.values()).sort((first, second) => first.order - second.order);
}

function normalizeFollowUpDefault(value: string): FollowUpDefaultOption {
  return followUpDefaultOptions.some((option) => option.value === value)
    ? (value as FollowUpDefaultOption)
    : defaultWorkflowSettings.defaultFollowUpOption;
}

function normalizeDensity(value: string): WorkflowDefaultDensity {
  return workflowDensityOptions.some((option) => option.value === value)
    ? (value as WorkflowDefaultDensity)
    : defaultWorkflowSettings.defaultDensity;
}

function normalizeLandingPage(value: string): WorkflowDefaultLandingPage {
  return workflowLandingPageOptions.some((option) => option.value === value)
    ? (value as WorkflowDefaultLandingPage)
    : defaultWorkflowSettings.defaultLandingPage;
}

export async function getWorkflowSettingsForUser(userId?: string | null): Promise<WorkflowSettingsView> {
  if (!userId || shouldUseDemoData() || !canUseDatabase()) {
    return defaultWorkflowSettings;
  }

  try {
    const prisma = getPrismaClient();
    const settings = await prisma.workflowSettings.findUnique({
      where: { userId }
    });

    if (!settings) {
      return defaultWorkflowSettings;
    }

    return {
      decisionStatuses: parseDecisionStatusesJson(settings.decisionStatusesJson),
      defaultFollowUpOption: normalizeFollowUpDefault(settings.defaultFollowUpOption),
      defaultDensity: normalizeDensity(settings.defaultDensity),
      defaultLandingPage: normalizeLandingPage(settings.defaultLandingPage),
      hideLeadCaptureBeta: Boolean(settings.hideLeadCaptureBeta)
    };
  } catch (error) {
    console.error(error);
    return defaultWorkflowSettings;
  }
}

export function buildDecisionStatusConfig({
  value,
  label,
  tone,
  order,
  isActive,
  defaultConfig
}: {
  value: string;
  label: string;
  tone: string;
  order: number;
  isActive: boolean;
  defaultConfig?: PropertyDecisionStatusConfig;
}) {
  const normalizedTone = normalizeDecisionTone(tone);

  return {
    value: value as PropertyInterestStatus,
    label: label.trim(),
    tone: normalizedTone as PropertyDecisionTone,
    className: getDecisionToneClassName(normalizedTone),
    order,
    isActive,
    isTerminal: defaultConfig?.isTerminal ?? value === "rejected",
    isApplying: defaultConfig?.isApplying ?? value === "applying"
  } satisfies PropertyDecisionStatusConfig;
}
