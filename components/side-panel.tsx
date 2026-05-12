"use client";

import { ReactNode, useEffect, useId, useRef } from "react";

export function SidePanel({
  open,
  title,
  eyebrow,
  onClose,
  children,
  footer
}: {
  open: boolean;
  title: string;
  eyebrow?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus({ preventScroll: true });

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/30 backdrop-blur-[2px]"
        aria-label="Close side panel"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col border-l border-line bg-white shadow-[0_28px_80px_-28px_rgba(15,23,42,0.5)]"
      >
        <div className="border-b border-line/80 px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              {eyebrow ? <p className="app-kicker">{eyebrow}</p> : null}
              <h2 id={titleId} className="mt-1 truncate text-xl font-semibold tracking-tight text-ink">
                {title}
              </h2>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-white text-lg font-semibold text-slate-500 shadow-sm transition hover:border-accent hover:text-accent"
              aria-label="Close"
            >
              x
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          {children}
        </div>

        {footer ? (
          <div className="border-t border-line/80 bg-slate-50/90 px-5 py-4">
            {footer}
          </div>
        ) : null}
      </aside>
    </div>
  );
}
