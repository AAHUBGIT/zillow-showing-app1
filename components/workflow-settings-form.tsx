"use client";

import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { InlineSpinner } from "@/components/inline-spinner";
import { saveWorkflowSettings } from "@/lib/actions";
import {
  defaultPropertyDecisionStatuses,
  propertyDecisionToneOptions,
  type PropertyDecisionStatusConfig,
  type PropertyDecisionTone
} from "@/lib/property-decision-statuses";
import {
  createStatusSlug,
  followUpDefaultOptions,
  workflowDensityOptions,
  workflowLandingPageOptions,
  type WorkflowSettingsView
} from "@/lib/workflow-settings";

type StatusDraft = {
  value: string;
  label: string;
  tone: PropertyDecisionTone;
  isActive: boolean;
  isTerminal: boolean;
  isApplying: boolean;
};

export function WorkflowSettingsForm({
  settings
}: {
  settings: WorkflowSettingsView;
}) {
  const [statuses, setStatuses] = useState<StatusDraft[]>(
    settings.decisionStatuses.map(toDraftStatus)
  );
  const [newStatusLabel, setNewStatusLabel] = useState("");
  const errors = useMemo(() => getStatusErrors(statuses), [statuses]);

  function updateStatus(index: number, changes: Partial<StatusDraft>) {
    setStatuses((current) =>
      current.map((status, currentIndex) =>
        currentIndex === index ? { ...status, ...changes } : status
      )
    );
  }

  function moveStatus(index: number, direction: -1 | 1) {
    setStatuses((current) => {
      const next = [...current];
      const targetIndex = index + direction;

      if (targetIndex < 0 || targetIndex >= next.length) {
        return next;
      }

      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  }

  function addCustomStatus() {
    const label = newStatusLabel.trim();
    const slug = createStatusSlug(label);

    if (!label || !slug || statuses.some((status) => status.value === slug)) {
      return;
    }

    setStatuses((current) => [
      ...current,
      {
        value: slug,
        label,
        tone: "blue",
        isActive: true,
        isTerminal: false,
        isApplying: false
      }
    ]);
    setNewStatusLabel("");
  }

  function resetDefaults() {
    if (window.confirm("Reset workflow settings to defaults?")) {
      setStatuses(defaultPropertyDecisionStatuses.map(toDraftStatus));
    }
  }

  return (
    <form action={saveWorkflowSettings} className="grid gap-5">
      <section className="app-panel p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="app-eyebrow">Property Decision Statuses</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink">
              Customize decision stages
            </h2>
            <p className="app-copy mt-2">
              Rename, reorder, hide, and add statuses without changing saved property decisions.
            </p>
          </div>
          <button
            type="button"
            onClick={resetDefaults}
            className="app-button-secondary"
          >
            Reset to defaults
          </button>
        </div>

        {errors.length > 0 ? (
          <div className="mt-4 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {errors[0]}
          </div>
        ) : null}

        <div className="mt-5 grid gap-3">
          {statuses.map((status, index) => (
            <div
              key={status.value}
              className="grid gap-3 rounded-3xl border border-line/80 bg-white/90 p-3 lg:grid-cols-[minmax(0,1.2fr)_160px_120px_160px]"
            >
              <input type="hidden" name="statusValue" value={status.value} />
              <input type="hidden" name="statusOrder" value={(index + 1) * 10} />
              <input type="hidden" name="statusTerminal" value={status.isTerminal ? "true" : "false"} />
              <input type="hidden" name="statusApplying" value={status.isApplying ? "true" : "false"} />

              <label className="grid gap-1.5 text-sm font-medium text-slate-700">
                Label
                <input
                  name="statusLabel"
                  value={status.label}
                  onChange={(event) => updateStatus(index, { label: event.target.value })}
                  className="app-input bg-white text-ink"
                  maxLength={60}
                />
                <span className="text-xs text-slate-500">Value: {status.value}</span>
              </label>

              <label className="grid gap-1.5 text-sm font-medium text-slate-700">
                Tone
                <select
                  name="statusTone"
                  value={status.tone}
                  onChange={(event) => updateStatus(index, { tone: event.target.value as PropertyDecisionTone })}
                  className="app-input bg-white text-ink"
                >
                  {propertyDecisionToneOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-2 rounded-2xl border border-line/70 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  name="statusActive"
                  value={status.value}
                  checked={status.isActive}
                  onChange={(event) => updateStatus(index, { isActive: event.target.checked })}
                  className="h-4 w-4"
                />
                Show option
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => moveStatus(index, -1)}
                  disabled={index === 0}
                  className="app-button-secondary min-h-[40px] px-3 py-2 text-xs disabled:opacity-45"
                >
                  Up
                </button>
                <button
                  type="button"
                  onClick={() => moveStatus(index, 1)}
                  disabled={index === statuses.length - 1}
                  className="app-button-secondary min-h-[40px] px-3 py-2 text-xs disabled:opacity-45"
                >
                  Down
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-3 rounded-3xl border border-dashed border-line bg-slate-50 p-4 sm:grid-cols-[minmax(0,1fr)_auto]">
          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            Add custom status
            <input
              value={newStatusLabel}
              onChange={(event) => setNewStatusLabel(event.target.value)}
              className="app-input bg-white text-ink"
              placeholder="Tour again"
              maxLength={60}
            />
          </label>
          <button type="button" onClick={addCustomStatus} className="app-button-primary self-end">
            Add status
          </button>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <SettingsBlock
          eyebrow="Follow-Up Defaults"
          title="Default next follow-up"
          copy="Preselect the next follow-up timing in follow-up queue dialogs."
        >
          <select
            name="defaultFollowUpOption"
            defaultValue={settings.defaultFollowUpOption}
            className="app-input bg-white text-ink"
          >
            {followUpDefaultOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </SettingsBlock>

        <SettingsBlock
          eyebrow="App Preferences"
          title="Workspace defaults"
          copy="Set the density preference and default landing target for future workflow setup."
        >
          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            Default density
            <select
              name="defaultDensity"
              defaultValue={settings.defaultDensity}
              className="app-input bg-white text-ink"
            >
              {workflowDensityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-3 grid gap-1.5 text-sm font-medium text-slate-700">
            Default landing page
            <select
              name="defaultLandingPage"
              defaultValue={settings.defaultLandingPage}
              className="app-input bg-white text-ink"
            >
              {workflowLandingPageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </SettingsBlock>

        <SettingsBlock
          eyebrow="Beta Features"
          title="Lead Capture beta"
          copy="Store whether the unfinished Lead Capture beta should stay hidden from primary workflow navigation."
        >
          <label className="flex items-center gap-2 rounded-2xl border border-line/80 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              name="hideLeadCaptureBeta"
              value="true"
              defaultChecked={settings.hideLeadCaptureBeta}
              className="h-4 w-4"
            />
            Hide Lead Capture beta
          </label>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            Lead Capture is not shown in the main sidebar right now; this setting is persisted for
            when beta navigation returns.
          </p>
        </SettingsBlock>
      </section>

      <div className="flex flex-col gap-3 rounded-3xl border border-line/80 bg-white/90 p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">
          Settings save to this workspace and fall back to defaults if the settings record is missing.
        </p>
        <SaveSettingsButton disabled={errors.length > 0} />
      </div>
    </form>
  );
}

function toDraftStatus(status: PropertyDecisionStatusConfig): StatusDraft {
  return {
    value: status.value,
    label: status.label,
    tone: status.tone,
    isActive: status.isActive,
    isTerminal: Boolean(status.isTerminal),
    isApplying: Boolean(status.isApplying)
  };
}

function getStatusErrors(statuses: StatusDraft[]) {
  const errors: string[] = [];
  const labels = new Set<string>();
  const values = new Set<string>();

  for (const status of statuses) {
    const label = status.label.trim();
    const value = status.value.trim();

    if (!label) {
      errors.push("Every decision status needs a label.");
    }

    if (!/^[a-z0-9_]{2,60}$/.test(value)) {
      errors.push("Decision status values must use lowercase letters, numbers, and underscores.");
    }

    const normalizedLabel = label.toLowerCase();
    if (normalizedLabel && labels.has(normalizedLabel)) {
      errors.push("Decision status labels must be unique.");
    }

    if (value && values.has(value)) {
      errors.push("Decision status values must be unique.");
    }

    labels.add(normalizedLabel);
    values.add(value);
  }

  if (!statuses.some((status) => status.isActive)) {
    errors.push("At least one decision status must remain visible.");
  }

  return errors;
}

function SettingsBlock({
  eyebrow,
  title,
  copy,
  children
}: {
  eyebrow: string;
  title: string;
  copy: string;
  children: React.ReactNode;
}) {
  return (
    <section className="app-panel p-4 sm:p-5">
      <p className="app-eyebrow">{eyebrow}</p>
      <h2 className="mt-2 text-lg font-semibold tracking-tight text-ink">{title}</h2>
      <p className="app-copy mt-2">{copy}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function SaveSettingsButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="app-button-primary disabled:cursor-not-allowed disabled:opacity-55"
    >
      {pending ? (
        <>
          <InlineSpinner />
          <span>Saving...</span>
        </>
      ) : (
        "Save settings"
      )}
    </button>
  );
}
