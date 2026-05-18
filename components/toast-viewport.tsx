"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const toastMessages: Record<string, string> = {
  "lead-created": "Lead created successfully.",
  "lead-imported": "Imported lead created successfully.",
  "status-updated": "Lead status updated.",
  "showing-scheduled": "Showing scheduled successfully.",
  "showing-confirmed": "Showing confirmed.",
  "showing-completed": "Showing completed.",
  "showing-no_show": "Showing marked no-show.",
  "showing-canceled": "Showing canceled.",
  "showing-rescheduled": "Showing marked for reschedule.",
  "route-copied": "Route link copied to clipboard.",
  "property-added": "Property added to this customer.",
  "property-listing-added": "Property listing added to inventory.",
  "property-duplicate": "This property may already exist. Review it before creating another copy.",
  "property-updated": "Property details updated.",
  "property-toured": "Property marked as toured.",
  "property-scheduled": "Property showing scheduled.",
  "property-rejected": "Property marked as rejected.",
  "property-applying": "Property moved to applying.",
  "preferences-updated": "Client preferences saved.",
  "follow-up-updated": "Follow-up date updated.",
  "follow-up-completed": "Follow-up marked completed.",
  "follow-up-logged": "Follow-up logged.",
  "follow-up-snoozed": "Follow-up snoozed.",
  "follow-up-no-answer": "No answer logged.",
  "follow-up-cleared": "Follow-up cleared.",
  "follow-up-set": "Next follow-up set.",
  "follow-up-note-added": "Follow-up note added.",
  "route-stop-completed": "Route stop marked as completed.",
  "route-stop-reopened": "Route stop moved back into the active route.",
  "route-note-saved": "Route note saved.",
  "route-order-updated": "Route updated",
  "communication-logged": "Activity logged.",
  "activity-logged": "Activity logged.",
  "message-copied": "Message copied",
  "template-saved": "Communication template saved.",
  "login-success": "Logged in successfully.",
  "logout-success": "Logged out successfully.",
  "login-error": "That email or password did not match.",
  "preview-readonly": "This preview workspace is read-only, so changes are disabled.",
  "database-unavailable": "Database is unavailable right now, so changes could not be saved.",
  "save-error": "Something went wrong while saving. Please try again.",
  "validation-error": "Please fix the highlighted fields before saving."
};

export function ToastViewport() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const showToast = (nextMessage: string) => {
      setMessage(nextMessage);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setMessage("");
      }, 2600);
    };

    const toastKey = searchParams.get("toast");
    if (toastKey && toastMessages[toastKey]) {
      showToast(toastMessages[toastKey]);
      router.replace(pathname, { scroll: false });
    }

    const handleCustomToast = (event: Event) => {
      const customEvent = event as CustomEvent<{ message?: string; toastKey?: string }>;
      const nextMessage =
        customEvent.detail?.message ||
        (customEvent.detail?.toastKey ? toastMessages[customEvent.detail.toastKey] : "");

      if (nextMessage) {
        showToast(nextMessage);
      }
    };

    window.addEventListener("app-toast", handleCustomToast as EventListener);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      window.removeEventListener("app-toast", handleCustomToast as EventListener);
    };
  }, [pathname, router, searchParams]);

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[60]">
      <div
        className={`min-w-[240px] rounded-2xl bg-ink px-4 py-3 text-sm font-medium text-white shadow-panel transition-all duration-300 ${
          message ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        {message}
      </div>
    </div>
  );
}
