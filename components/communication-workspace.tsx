"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { AutoResizeTextarea } from "@/components/auto-resize-textarea";
import { InlineSpinner } from "@/components/inline-spinner";
import { TooltipShell } from "@/components/tooltip-shell";
import { createCommunicationTemplate, logCommunicationActivityInline } from "@/lib/actions";
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
  const [recentActivities, setRecentActivities] = useState(activities);
  const [isLoggingActivity, setIsLoggingActivity] = useState(false);
  const [pendingQuickLog, setPendingQuickLog] = useState("");
  const [quickNote, setQuickNote] = useState("");
  const [quickNoteError, setQuickNoteError] = useState("");
  const [isMessageCopied, setIsMessageCopied] = useState(false);
  const communicationPanelRef = useRef<HTMLDivElement | null>(null);
  const saveInFlightRef = useRef(false);
  const copyResetTimeoutRef = useRef<number | null>(null);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId),
    [selectedTemplateId, templates]
  );

  const phone = lead.phone.trim();
  const email = lead.email.trim();
  const hasPhone = phone.length > 0;
  const hasEmail = email.length > 0;
  const phoneHref = hasPhone ? `tel:${normalizePhoneForHref(phone)}` : "";
  const smsHref = hasPhone ? buildSmsHref(phone, body) : "";
  const emailHref = hasEmail ? buildEmailHref(email, subject, body) : "";
  const canLogActivity = body.trim().length > 0;
  const canSaveTemplate = templateName.trim().length > 0 && body.trim().length > 0;

  useEffect(() => {
    return () => {
      if (copyResetTimeoutRef.current) {
        window.clearTimeout(copyResetTimeoutRef.current);
      }
    };
  }, []);

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

  async function copyMessage() {
    const messageBody = body.trim();

    if (!messageBody) {
      emitAppToast({ message: "Add a message before copying." });
      return;
    }

    try {
      await navigator.clipboard.writeText(messageBody);
      setIsMessageCopied(true);
      emitAppToast({ message: "Message copied" });

      if (copyResetTimeoutRef.current) {
        window.clearTimeout(copyResetTimeoutRef.current);
      }

      copyResetTimeoutRef.current = window.setTimeout(() => {
        setIsMessageCopied(false);
      }, 1600);
    } catch {
      setIsMessageCopied(false);
      emitAppToast({ message: "Unable to copy message" });
    }
  }

  async function logActivity(overrides: Partial<{
    channel: CommunicationChannel;
    direction: CommunicationDirection;
    subject: string;
    body: string;
    outcome: string;
  }> = {}, options: { successMessage?: string; preserveScroll?: boolean } = {}) {
    if (saveInFlightRef.current) {
      return false;
    }

    const activityBody = (overrides.body ?? body).trim();

    if (!activityBody) {
      emitAppToast({ message: "Add communication text before logging activity." });
      return false;
    }

    saveInFlightRef.current = true;
    setIsLoggingActivity(true);

    try {
      const result = await logCommunicationActivityInline({
        leadId: lead.id,
        channel: overrides.channel || channel,
        direction: overrides.direction || direction,
        templateId: selectedTemplateId,
        subject: overrides.subject ?? subject,
        body: activityBody,
        outcome: overrides.outcome ?? outcome
      });

      if (!result.success) {
        emitAppToast({ toastKey: result.toastKey });
        return false;
      }

      const scrollPosition = options.preserveScroll
        ? { left: window.scrollX, top: window.scrollY }
        : null;

      setRecentActivities((current) => [result.activity, ...current]);
      setOutcome("");

      if (scrollPosition) {
        restoreScrollPosition(scrollPosition);
      }

      if (options.successMessage) {
        emitAppToast({ message: options.successMessage });
      } else {
        emitAppToast({ toastKey: result.toastKey });
      }

      return true;
    } catch {
      emitAppToast({ toastKey: "save-error" });
      return false;
    } finally {
      saveInFlightRef.current = false;
      setIsLoggingActivity(false);
    }
  }

  async function logQuickActivity(kind: "call" | "text" | "email" | "no-answer" | "note") {
    if (saveInFlightRef.current) {
      return;
    }

    const noteBody = quickNote.trim();

    if (kind === "note" && !noteBody) {
      setQuickNoteError("Type a note before logging it.");
      return;
    }

    setQuickNoteError("");
    setPendingQuickLog(kind);

    const firstName = lead.fullName.split(" ").filter(Boolean)[0] || lead.fullName;
    const quickLogConfig = {
      call: {
        channel: "call" as const,
        direction: "outbound" as const,
        subject: "Call logged",
        body: body.trim() || `Called ${lead.fullName}.`,
        outcome: outcome.trim() || "Call completed."
      },
      text: {
        channel: "text" as const,
        direction: "outbound" as const,
        subject: "Text logged",
        body: body.trim() || `Texted ${firstName}.`,
        outcome: outcome.trim() || "Text sent."
      },
      email: {
        channel: "email" as const,
        direction: "outbound" as const,
        subject: subject.trim() || "Email logged",
        body: body.trim() || `Emailed ${lead.fullName}.`,
        outcome: outcome.trim() || "Email sent."
      },
      "no-answer": {
        channel: "call" as const,
        direction: "outbound" as const,
        subject: "No answer",
        body: `Called ${lead.fullName}. No answer.`,
        outcome: "No answer."
      },
      note: {
        channel: "note" as const,
        direction: "internal" as const,
        subject: subject.trim() || "Internal note",
        body: noteBody,
        outcome: ""
      }
    }[kind];

    const quickLogToastMessages = {
      call: "Call logged",
      text: "Text logged",
      email: "Email logged",
      "no-answer": "No answer logged",
      note: "Note logged"
    }[kind];

    try {
      const didLog = await logActivity(quickLogConfig, {
        successMessage: quickLogToastMessages,
        preserveScroll: true
      });

      if (didLog && kind === "note") {
        setQuickNote("");
      }
    } finally {
      setPendingQuickLog("");
    }
  }

  return (
    <div ref={communicationPanelRef} className="app-panel scroll-mt-28 p-5 sm:p-6">
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
          <div className="app-chip">{recentActivities.length} logged</div>
        </div>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="app-subpanel p-5">
          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              if (!validateLogForm()) {
                return;
              }
              void logActivity();
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
                <ContactLink
                  href={phoneHref}
                  protocolText={hasPhone ? `tel:${phone}` : "No phone number"}
                  disabled={!hasPhone}
                  disabledReason="Phone unavailable"
                  toastMessage="Opening phone app"
                >
                  Call
                </ContactLink>
                <ContactLink
                  href={smsHref}
                  protocolText={hasPhone ? `sms:${phone}` : "No phone number"}
                  disabled={!hasPhone}
                  disabledReason="Phone unavailable"
                  toastMessage="Opening text app"
                >
                  Text
                </ContactLink>
                <ContactLink
                  href={emailHref}
                  protocolText={hasEmail ? `mailto:${email}` : "No email address"}
                  disabled={!hasEmail}
                  disabledReason="Email unavailable"
                  toastMessage="Opening email app"
                >
                  Email
                </ContactLink>
                <button
                  type="button"
                  onClick={copyMessage}
                  disabled={!body.trim()}
                  className="app-button-secondary min-h-[52px] px-4 py-3 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-55"
                >
                  {isMessageCopied ? "Copied" : "Copy message"}
                </button>
              </div>

              <TooltipShell
                disabled={isPreviewReadonly}
                message="This preview workspace is read-only. Use a live workspace to log activity."
              >
                <LogActivityButton disabled={isPreviewReadonly || !canLogActivity} pending={isLoggingActivity} />
              </TooltipShell>
            </div>

            <div className="rounded-3xl border border-line/80 bg-white/80 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="app-kicker">Quick Logs</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Capture common touchpoints without changing the current draft.
                  </p>
                </div>
              </div>
              <div className="mt-4 grid gap-3">
                <label className="flex min-w-0 flex-col gap-2">
                  <span className="text-sm font-medium text-slate-700">Quick note</span>
                  <AutoResizeTextarea
                    rows={3}
                    value={quickNote}
                    maxLength={fieldMaxLengths.communicationBody}
                    onChange={(event) => {
                      setQuickNote(event.target.value);
                      if (event.target.value.trim()) {
                        setQuickNoteError("");
                      }
                    }}
                    aria-label="Quick internal note"
                    aria-invalid={Boolean(quickNoteError)}
                    aria-describedby="quick-note-helper"
                    className={`app-textarea min-h-[96px] ${
                      quickNoteError ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100" : ""
                    }`}
                    placeholder="Type an internal note before using Add Note."
                  />
                  <p
                    id="quick-note-helper"
                    className={`text-xs ${quickNoteError ? "font-medium text-rose-600" : "text-slate-500"}`}
                  >
                    {quickNoteError || "Required only when using Add Note."}
                  </p>
                </label>

                <div className="flex flex-wrap gap-2">
                  <QuickLogButton
                    label="Log Call"
                    isPending={pendingQuickLog === "call"}
                    disabled={isPreviewReadonly || isLoggingActivity}
                    onClick={() => void logQuickActivity("call")}
                  />
                  <QuickLogButton
                    label="Log Text"
                    isPending={pendingQuickLog === "text"}
                    disabled={isPreviewReadonly || isLoggingActivity}
                    onClick={() => void logQuickActivity("text")}
                  />
                  <QuickLogButton
                    label="Log Email"
                    isPending={pendingQuickLog === "email"}
                    disabled={isPreviewReadonly || isLoggingActivity}
                    onClick={() => void logQuickActivity("email")}
                  />
                  <QuickLogButton
                    label="No Answer"
                    isPending={pendingQuickLog === "no-answer"}
                    disabled={isPreviewReadonly || isLoggingActivity}
                    onClick={() => void logQuickActivity("no-answer")}
                  />
                  <QuickLogButton
                    label="Add Note"
                    isPending={pendingQuickLog === "note"}
                    disabled={isPreviewReadonly || isLoggingActivity}
                    onClick={() => void logQuickActivity("note")}
                  />
                </div>
              </div>
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
              <p className="app-kicker">Recent Activity</p>
              <p className="mt-1 text-sm text-slate-500">Most recent touchpoints for this customer.</p>
            </div>
            <div className="app-chip">{recentActivities.length} entries</div>
          </div>

          {recentActivities.length === 0 ? (
            <div className="mt-5 rounded-3xl border border-dashed border-line bg-white/70 px-5 py-10 text-center">
              <p className="text-sm font-semibold text-ink">No communication logged yet</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Save texts, calls, emails, and internal notes here as the conversation develops.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {recentActivities.map((activity) => (
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
  protocolText,
  disabled,
  disabledReason,
  toastMessage,
  children
}: {
  href: string;
  protocolText: string;
  disabled?: boolean;
  disabledReason?: string;
  toastMessage: string;
  children: ReactNode;
}) {
  if (disabled) {
    return (
      <span
        className="app-button-secondary min-h-[52px] cursor-not-allowed px-4 py-3 opacity-50"
        aria-disabled="true"
      >
        <span>{children}</span>
        <span className="text-[11px] font-semibold text-slate-400">{disabledReason || protocolText}</span>
      </span>
    );
  }

  return (
    <a
      href={href}
      onClick={() => emitAppToast({ message: toastMessage })}
      className="app-button-secondary min-h-[52px] px-4 py-3 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/20"
    >
      <span>{children}</span>
      <span className="text-[11px] font-semibold text-slate-400">{protocolText}</span>
    </a>
  );
}

function LogActivityButton({
  disabled = false,
  pending = false
}: {
  disabled?: boolean;
  pending?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="app-button-primary min-h-[52px] px-5 py-3 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-55"
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

function QuickLogButton({
  label,
  isPending,
  disabled,
  onClick
}: {
  label: string;
  isPending: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isPending}
      className="app-button-secondary min-h-[52px] px-4 py-3 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-55"
    >
      {isPending ? (
        <>
          <InlineSpinner />
          <span>Logging...</span>
        </>
      ) : (
        label
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
      className="app-button-secondary min-h-[52px] px-4 py-3 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-55"
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

function restoreScrollPosition(scrollPosition: { left: number; top: number }) {
  window.requestAnimationFrame(() => {
    window.scrollTo(scrollPosition.left, scrollPosition.top);
  });
}

function normalizePhoneForHref(phone: string) {
  return phone.replace(/[^\d+]/g, "") || phone;
}

function buildSmsHref(phone: string, message: string) {
  const normalizedPhone = normalizePhoneForHref(phone);
  const trimmedMessage = message.trim();

  if (!trimmedMessage) {
    return `sms:${normalizedPhone}`;
  }

  return `sms:${normalizedPhone}?body=${encodeURIComponent(trimmedMessage)}`;
}

function buildEmailHref(email: string, subject: string, message: string) {
  const params = new URLSearchParams();
  const trimmedSubject = subject.trim();
  const trimmedMessage = message.trim();

  if (trimmedSubject) {
    params.set("subject", trimmedSubject);
  }

  if (trimmedMessage) {
    params.set("body", trimmedMessage);
  }

  const query = params.toString();
  return query ? `mailto:${email}?${query}` : `mailto:${email}`;
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
