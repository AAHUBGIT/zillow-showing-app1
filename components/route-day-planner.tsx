"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CopyRouteButton } from "@/components/copy-route-button";
import { LoadingLink } from "@/components/loading-link";
import { PriorityBadge } from "@/components/priority-badge";
import { RouteMapPreview } from "@/components/route-map-preview";
import { RouteStopControls } from "@/components/route-stop-controls";
import { SourceBadge } from "@/components/source-badge";
import { emitAppToast } from "@/lib/client-toast";
import { moveRouteStopInline, toggleRouteStopCompletedInline, updateRouteStopNoteInline } from "@/lib/actions";
import { formatDateLabel, formatDateTimeLabel } from "@/lib/date";
import {
  buildGoogleMapsDirectionsLink,
  buildRoutePreviewEmbedLink,
  getRouteDaySummary,
  sortRouteStops
} from "@/lib/route-planner";
import { LeadWithProperties } from "@/lib/types";

export function RouteDayPlanner({
  day,
  initialStops,
  isPreviewReadonly = false
}: {
  day: string;
  initialStops: LeadWithProperties[];
  isPreviewReadonly?: boolean;
}) {
  const router = useRouter();
  const [stops, setStops] = useState<LeadWithProperties[]>(() => sortRouteStops(initialStops));

  useEffect(() => {
    setStops(sortRouteStops(initialStops));
  }, [initialStops]);

  const directionsLink = useMemo(
    () => buildGoogleMapsDirectionsLink(stops.map((lead) => lead.propertyAddress)),
    [stops]
  );
  const routePreviewLink = useMemo(
    () => buildRoutePreviewEmbedLink(stops.map((lead) => lead.propertyAddress)),
    [stops]
  );
  const routeSummary = useMemo(() => getRouteDaySummary(stops), [stops]);

  async function handleMove(leadId: string, direction: "up" | "down") {
    const currentIndex = stops.findIndex((stop) => stop.id === leadId);
    const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= stops.length) {
      emitAppToast({ toastKey: "save-error" });
      return;
    }

    const previousStops = stops;
    const nextStops = [...stops];
    [nextStops[currentIndex], nextStops[nextIndex]] = [nextStops[nextIndex], nextStops[currentIndex]];
    setStops(nextStops);

    const result = await moveRouteStopInline({ leadId, showingDate: day, direction });

    if (!result.success) {
      setStops(previousStops);
      emitAppToast({ toastKey: result.toastKey });
      return;
    }

    emitAppToast({ toastKey: result.toastKey });
    router.refresh();
  }

  async function handleToggleCompleted(leadId: string, nextCompleted: boolean) {
    const previousStops = stops;
    setStops((current) =>
      current.map((stop) =>
        stop.id === leadId ? { ...stop, routeCompleted: nextCompleted } : stop
      )
    );

    const result = await toggleRouteStopCompletedInline({
      leadId,
      completed: nextCompleted
    });

    if (!result.success) {
      setStops(previousStops);
      emitAppToast({ toastKey: result.toastKey });
      return;
    }

    emitAppToast({ toastKey: result.toastKey });
    router.refresh();
  }

  async function handleSaveNote(leadId: string, note: string) {
    const nextRouteNote = note.trim().slice(0, 160);
    const previousStops = stops;
    setStops((current) =>
      current.map((stop) => (stop.id === leadId ? { ...stop, routeNote: nextRouteNote } : stop))
    );

    const result = await updateRouteStopNoteInline({ leadId, routeNote: nextRouteNote });

    if (!result.success) {
      setStops(previousStops);
      emitAppToast({ toastKey: result.toastKey });
      return;
    }

    emitAppToast({ toastKey: result.toastKey });
    router.refresh();
  }

  return (
    <section className="app-subpanel overflow-hidden p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-lg font-semibold tracking-tight text-ink">{formatDateLabel(day)}</p>
          <p className="mt-1 text-sm text-slate-600">
            {stops.length} scheduled {stops.length === 1 ? "showing" : "showings"}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <div className="app-chip">{stops[0]?.showingDate || day}</div>
            <div className="app-chip">
              {stops.filter((lead) => lead.priority === "urgent" || lead.priority === "high").length} priority stops
            </div>
            <div className="app-chip">{routeSummary.totalDriveLabel}</div>
            <div className="app-chip">Manual reorder available</div>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href={directionsLink}
            target="_blank"
            rel="noreferrer"
            className="app-button-primary"
          >
            Open Google Maps Route
          </a>
          <CopyRouteButton link={directionsLink} />
        </div>
      </div>

      {routeSummary.warning ? (
        <div className="mt-5 rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-semibold">Distance planning warning</p>
          <p className="mt-1">{routeSummary.warning}</p>
        </div>
      ) : null}

      <div className="mt-5 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <RouteMapPreview
          embedLink={routePreviewLink}
          title={`Map preview for ${formatDateLabel(day)}`}
        />

        <div className="grid gap-3">
          {stops.map((lead, index) => (
            <div key={lead.id} className="space-y-3">
              {index > 0 ? (
                <div
                  className={`rounded-2xl border px-4 py-3 text-sm ${
                    routeSummary.segments[index - 1]?.unrealistic
                      ? "border-amber-200 bg-amber-50 text-amber-900"
                      : "border-line/70 bg-slate-50 text-slate-600"
                  }`}
                >
                  <p className="font-semibold">
                    Drive from stop {index} to stop {index + 1}: {routeSummary.segments[index - 1]?.label}
                  </p>
                  {routeSummary.segments[index - 1]?.warning ? (
                    <p className="mt-1 text-xs leading-5">
                      {routeSummary.segments[index - 1]?.warning}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs leading-5">
                      Keep this timing in mind when confirming access windows and travel buffers.
                    </p>
                  )}
                </div>
              ) : null}

              <div
                className={`rounded-3xl border p-4 shadow-sm transition ${
                  lead.routeCompleted
                    ? "border-emerald-200 bg-emerald-50/70"
                    : "border-white/90 bg-white"
                }`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                        Stop {index + 1}
                      </p>
                      {lead.routeCompleted ? (
                        <span className="rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
                          Completed
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-base font-semibold tracking-tight text-ink">
                      {lead.fullName}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">{lead.propertyAddress}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <PriorityBadge priority={lead.priority} />
                      <SourceBadge source={lead.source} />
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      {formatDateTimeLabel(lead.showingDate!, lead.showingTime!)}
                    </p>
                    {lead.routeNote ? (
                      <p className="mt-3 rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
                        {lead.routeNote}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex w-full max-w-xl flex-col gap-3">
                    <RouteStopControls
                      routeCompleted={lead.routeCompleted}
                      routeNote={lead.routeNote}
                      canMoveUp={index > 0}
                      canMoveDown={index < stops.length - 1}
                      isPreviewReadonly={isPreviewReadonly}
                      onToggleCompleted={(nextCompleted) =>
                        handleToggleCompleted(lead.id, nextCompleted)
                      }
                      onMove={(direction) => handleMove(lead.id, direction)}
                      onSaveNote={(note) => handleSaveNote(lead.id, note)}
                    />
                    <LoadingLink
                      href={`/leads/${lead.id}`}
                      className="app-button-secondary text-center"
                    >
                      View Lead
                    </LoadingLink>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
