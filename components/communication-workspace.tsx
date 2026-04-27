"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { AutoResizeTextarea } from "@/components/auto-resize-textarea";
import { InlineSpinner } from "@/components/inline-spinner";
import { TooltipShell } from "@/components/tooltip-shell";
import { createCommunicationActivity, createCommunicationTemplate } from "@/lib/actions";
import { emitAppToast } from "@/lib/client-toast";
import {
  communicationChannelOptions,
  communicationDirectionOptions,
  getCommunicationChannelLabel,
  getCommunicationDirectionLabel,
  hydrateCommunicationTemplate
} from "@/lib/communication";
import { fieldMaxLengths } from "@/lib/form-validation";
import {
  CommunicationActivity,
  CommunicationChannel,
  CommunicationDirection,
  CommunicationTemplate,
  Lead
} from "@/lib/types";

export function CommunicationWorkspace({
  lead,
  templates,
  activities,
  isPreviewReadonly = false
}: {
  lead: Lead;
  templates: CommunicationTemplate[];
  activities: CommunicationActivity[];
  isPreviewReadonly?: boolean;
}) {
  const initialTemplate = templates[0];
  const initialDraft = initialTemplate ? hydrateCommunicationTemplate(initialTemplate, lead) : null;
  const [selectedTemplateId, setSelectedTemplateId] = useState(initialTemplate?.id || "");
  const [channel, setChannel] = useState<CommunicationChannel>(initialTemplate?.channel || "text");
  const [direction, setDirection] = useState<CommunicationDirection>("outbound");
  const [subject, setSubject] = useState(initialDraft?.subject || "");
  const [body, setBody] = useState(initialDraft?.body || "");
  const [outcome, setOutcome] = useState("");
  const [templateName, setTemplateName] = useState("");

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId),
    [selectedTemplateId, templates]
  );

  const smsHref = `sms:${lead.phone}?body=${encodeURIComponent(body)}`;
  const emailHref = `mailto:${lead.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const canLogActivity = body.trim().length > 0;
  const canSaveTemplate = templateName.trim().length > 0 && body.trim().length > 0;

  function applyTemplate(templateId: string) {
    setSelectedTemplateId(templateId);

    const nextTemplate = templates.find((template) => template.id === templateId);
    if (!nextTemplate) {
      return;
    }

    const hydratedTemplate = hydrateCommunicationTemplate(nextTemplate, lead);
    setChannel(nextTemplate.channel);
    setSubject(hydratedTemplate.subject);
    setBody(hydratedTemplate.body);
  }

  function validateLogForm() {
    if (canLogActivity) {
      return true;
    }

    emitAppToast({ message: "Add communication text before logging activity." });
    return false;
  }

  function validateTemplateForm() {
    if (canSaveTemplate) {
      return true;
    }

    emitAppToast({ message: "Add a template name and message before saving." });
    return false;
  }

  return (
    <div className="app-panel p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="app-eyebrow">Communication Center</p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-ink sm:text-2xl">
            Templates and activity log
          </h3>
          <p className="app-copy mt-2 max-w-2xl">
            Draft reusable outreach, contact the customer, and keep each touchpoint attached to
            this record.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="app-chip">{templates.length} templates</div>
          <div className="app-chip">{activities.length} logged</div>
        </div>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="app-subpanel p-5">
          <form
            action={createCommunicationActivity}
            noValidate
            onSubmit={(event) => {
              if (!validateLogForm()) {
                event.preventDefault();
              }
            }}
            className="grid gap-4"
          >
            <input type="hidden" name="leadId" value={lead.id} />
            <input type="hidden" name="templateId" value={selectedTemplateId} />

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex min-w-0 flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">Template</span>
                <select
                  value={selectedTemplateId}
                  onChange={(event) => applyTemplate(event.target.value)}
                  aria-label="Choose communication template"
                  className="app-input"
                >
                  <option value="">Start blank</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name} ({getCommunicationChannelLabel(template.channel)})
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex min-w-0 flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">Channel</span>
                <select
                  name="channel"
                  value={channel}
                  onChange={(event) => setChannel(event.target.value as CommunicationChannel)}
                  aria-label="Communication channel"
                  className="app-input"
                >
                  {communicationChannelOptions.map((option) => (
                    <option key={option} value={option}>
                      {getCommunicationChannelLabel(option)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex min-w-0 flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">Direction</span>
                <select
                  name="direction"
                  value={direction}
                  onChange={(event) => setDirection(event.target.value as CommunicationDirection)}
                  aria-label="Communication direction"
                  className="app-input"
                >
                  {communicationDirectionOptions.map((option) => (
                    <option key={option} value={option}>
                      {getCommunicationDirectionLabel(option)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex min-w-0 flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">Subject</span>
                <input
                  type="text"
                  name="subject"
                  value={subject}
                  maxLength={fieldMaxLengths.communicationSubject}
                  onChange={(event) => setSubject(event.target.value)}
                  aria-label="Communication subject"
                  className="app-input"
                  placeholder={channel === "email" ? "Email subject" : "Optional summary"}
                />
              </label>
            </div>

            <label className="flex min-w-0 flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">Message or call notes</span>
              <AutoResizeTextarea
                name="body"
                rows={7}
                value={body}
                maxLength={fieldMaxLengths.communicationBody}
                required
                onChange={(event) => setBody(event.target.value)}
                aria-label="Communication body"
                className="app-textarea"
              />
              <p className="text-xs text-slate-500">
                Template variables are filled from this customer record.
              </p>
            </label>

            <label className="flex min-w-0 flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">Outcome</span>
              <AutoResizeTextarea
                name="outcome"
                rows={3}
                value={outcome}
                maxLength={fieldMaxLengths.communicationOutcome}
                onChange={(event) => setOutcome(event.target.value)}
                aria-label="Communication outcome"
                className="app-textarea min-h-[92px]"
                placeholder="Sent text, left voicemail, customer replied, next step..."
              />
            </label>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                <ContactLink href={`tel:${lead.phone}`} disabled={channel === "note"}>
                  Call
                </ContactLink>
                <ContactLink href={smsHref} disabled={!body.trim() || channel === "note"}>
                  Text
                </ContactLink>
                <ContactLink href={emailHref} disabled={!body.trim() || channel === "note"}>
                  Email
                </ContactLink>
              </div>

              <TooltipShell
                disabled={isPreviewReadonly}
                message="This preview workspace is read-only. Use a live workspace to log activity."
              >
                <LogActivityButton disabled={isPreviewReadonly || !canLogActivity} />
              </TooltipShell>
            </div>
          </form>

          <form
            action={createCommunicationTemplate}
            noValidate
            onSubmit={(event) => {
              if (!validateTemplateForm()) {
                event.preventDefault();
              }
            }}
            className="mt-5 rounded-3xl border border-line/80 bg-white/80 p-4"
          >
            <input type="hidden" name="leadId" value={lead.id} />
            <input type="hidden" name="channel" value={channel} />
            <input type="hidden" name="subject" value={subject} />
            <input type="hidden" name="body" value={body} />

            <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
              <label className="flex min-w-0 flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">Save current draft as template</span>
                <input
                  type="text"
                  name="templateName"
                  value={templateName}
                  maxLength={fieldMaxLengths.communicationTemplateName}
                  onChange={(event) => setTemplateName(event.target.value)}
                  aria-label="Template name"
                  className="app-input"
                  placeholder={selectedTemplate ? `${selectedTemplate.name} variant` : "Template name"}
                />
              </label>

              <TooltipShell
                disabled={isPreviewReadonly}
                message="This preview workspace is read-only. Use a live workspace to save templates."
              >
                <SaveTemplateButton disabled={isPreviewReadonly || !canSaveTemplate} />
              </TooltipShell>
            </div>
          </form>
        </section>

        <section className="app-subpanel p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="app-kicker">Activity Log</p>
              <p className="mt-1 text-sm text-slate-500">Most recent touchpoints for this customer.</p>
            </div>
            <div className="app-chip">{activities.length} entries</div>
          </div>

          {activities.length === 0 ? (
            <div className="mt-5 rounded-3xl border border-dashed border-line bg-white/70 px-5 py-10 text-center">
              <p className="text-sm font-semibold text-ink">No communication logged yet</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Save texts, calls, emails, and internal notes here as the conversation develops.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {activities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function ContactLink({
  href,
  disabled,
  children
}: {
  href: string;
  disabled?: boolean;
  children: ReactNode;
}) {
  if (disabled) {
    return (
      <span className="app-button-secondary cursor-not-allowed opacity-50" aria-disabled="true">
        {children}
      </span>
    );
  }

  return (
    <a href={href} className="app-button-secondary">
      {children}
    </a>
  );
}

function LogActivityButton({ disabled = false }: { disabled?: boolean }) {
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
          <span>Logging...</span>
        </>
      ) : (
        "Log Activity"
      )}
    </button>
  );
}

function SaveTemplateButton({ disabled = false }: { disabled?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="app-button-secondary disabled:cursor-not-allowed disabled:opacity-55"
    >
      {pending ? (
        <>
          <InlineSpinner />
          <span>Saving...</span>
        </>
      ) : (
        "Save Template"
      )}
    </button>
  );
}

function ActivityItem({ activity }: { activity: CommunicationActivity }) {
  return (
    <article className="rounded-3xl border border-line/80 bg-white px-4 py-4 shadow-soft">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap gap-2">
            <span className="app-chip">{getCommunicationChannelLabel(activity.channel)}</span>
            <span className="app-chip">{getCommunicationDirectionLabel(activity.direction)}</span>
          </div>
          <p className="mt-3 text-sm font-semibold text-ink">
            {activity.subject || "Communication logged"}
          </p>
        </div>
        <time className="text-xs font-medium text-slate-500" dateTime={activity.occurredAt}>
          {formatActivityDate(activity.occurredAt)}
        </time>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{activity.body}</p>
      {activity.outcome ? (
        <div className="mt-3 rounded-2xl border border-line/70 bg-slate-50 px-3 py-3">
          <p className="app-kicker">Outcome</p>
          <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-600">{activity.outcome}</p>
        </div>
      ) : null}
    </article>
  );
}

function formatActivityDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}
