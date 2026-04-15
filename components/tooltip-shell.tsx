"use client";

import { useId } from "react";

export function TooltipShell({
  children,
  message,
  disabled = false
}: {
  children: React.ReactNode;
  message: string;
  disabled?: boolean;
}) {
  const tooltipId = useId();

  if (!disabled) {
    return <>{children}</>;
  }

  return (
    <span
      tabIndex={0}
      aria-describedby={tooltipId}
      className="group relative inline-flex focus:outline-none"
    >
      {children}
      <span
        id={tooltipId}
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-64 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-2xl bg-ink px-3 py-2 text-xs font-medium leading-5 text-white opacity-0 shadow-panel transition group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        {message}
      </span>
    </span>
  );
}
