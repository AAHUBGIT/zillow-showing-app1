"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { InlineSpinner } from "@/components/inline-spinner";
import { confirmDiscardPropertyFormChanges } from "@/components/property-form-dirty";

export function LoadingLink({
  href,
  className,
  children,
  loadingLabel,
  ariaLabel,
  dirtyScope,
  disabled,
  onClick,
  ...buttonProps
}: {
  href: string;
  className: string;
  children: ReactNode;
  loadingLabel?: string;
  ariaLabel?: string;
  dirtyScope?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">) {
  const pathname = usePathname();
  const [isPending, setIsPending] = useState(false);
  const pendingRef = useRef(false);
  const resetTimerRef = useRef<number | null>(null);
  const isCurrentPath = pathname === href;
  const isDisabled = Boolean(disabled || isPending);

  const clearResetTimer = useCallback(() => {
    if (resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  }, []);

  const resetPending = useCallback(() => {
    pendingRef.current = false;
    setIsPending(false);
    clearResetTimer();
  }, [clearResetTimer]);

  useEffect(() => {
    resetPending();
  }, [pathname, resetPending]);

  useEffect(() => {
    const resetWhenVisible = () => {
      if (document.visibilityState === "visible") {
        resetPending();
      }
    };

    window.addEventListener("pageshow", resetPending);
    window.addEventListener("popstate", resetPending);
    window.addEventListener("hashchange", resetPending);
    window.addEventListener("focus", resetPending);
    document.addEventListener("visibilitychange", resetWhenVisible);

    return () => {
      window.removeEventListener("pageshow", resetPending);
      window.removeEventListener("popstate", resetPending);
      window.removeEventListener("hashchange", resetPending);
      window.removeEventListener("focus", resetPending);
      document.removeEventListener("visibilitychange", resetWhenVisible);
      pendingRef.current = false;
      clearResetTimer();
    };
  }, [clearResetTimer, resetPending]);

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-busy={isPending}
      {...buttonProps}
      disabled={isDisabled}
      onClick={(event) => {
        onClick?.(event);

        if (event.defaultPrevented) {
          return;
        }

        if (disabled || pendingRef.current) {
          return;
        }

        if (!confirmDiscardPropertyFormChanges(dirtyScope)) {
          event.preventDefault();
          return;
        }

        const targetUrl = new URL(href, window.location.href);
        const currentUrl = new URL(window.location.href);
        const isSamePage =
          targetUrl.origin === currentUrl.origin &&
          targetUrl.pathname === currentUrl.pathname &&
          targetUrl.search === currentUrl.search;

        if (isSamePage) {
          if (targetUrl.hash && targetUrl.hash !== currentUrl.hash) {
            window.location.assign(targetUrl.href);
          }

          resetPending();
          return;
        }

        if (isCurrentPath) {
          resetPending();
          return;
        }

        pendingRef.current = true;
        setIsPending(true);
        resetTimerRef.current = window.setTimeout(resetPending, 6000);

        // Use a full document navigation for reliability across protected routes,
        // auth redirects, and Vercel deployment aliases.
        window.location.assign(href);
      }}
      className={`${className} touch-manipulation select-none ${isCurrentPath ? "cursor-default" : ""} disabled:cursor-progress disabled:opacity-75`}
    >
      {isPending ? <InlineSpinner /> : null}
      <span>{isPending ? loadingLabel || "Opening..." : children}</span>
    </button>
  );
}
