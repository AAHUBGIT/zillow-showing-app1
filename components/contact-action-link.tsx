"use client";

import type { MouseEvent, ReactNode } from "react";
import { emitAppToast } from "@/lib/client-toast";

type ContactActionType = "call" | "text" | "email";

const contactActionCopy: Record<
  ContactActionType,
  { label: string; toastMessage: string; disabledLabel: string }
> = {
  call: {
    label: "Call",
    toastMessage: "Opening phone app",
    disabledLabel: "Phone unavailable"
  },
  text: {
    label: "Text",
    toastMessage: "Opening text app",
    disabledLabel: "Phone unavailable"
  },
  email: {
    label: "Email",
    toastMessage: "Opening email app",
    disabledLabel: "Email unavailable"
  }
};

export function ContactActionLink({
  action,
  href,
  label,
  toastMessage,
  disabled = false,
  disabledLabel,
  helperText,
  className = "app-button-secondary min-h-[48px] px-4 py-2.5",
  children
}: {
  action: ContactActionType;
  href: string;
  label?: string;
  toastMessage?: string;
  disabled?: boolean;
  disabledLabel?: string;
  helperText?: string;
  className?: string;
  children?: ReactNode;
}) {
  const actionCopy = contactActionCopy[action];
  const displayLabel = label || actionCopy.label;
  const unavailableLabel = disabledLabel || actionCopy.disabledLabel;
  const resolvedToastMessage = toastMessage || actionCopy.toastMessage;
  const content = children || (
    <>
      <span>{disabled ? unavailableLabel : displayLabel}</span>
      {helperText ? (
        <span className="text-[11px] font-semibold text-slate-400">
          {disabled ? unavailableLabel : helperText}
        </span>
      ) : null}
    </>
  );

  function stopContactPropagation(event: MouseEvent<HTMLElement>) {
    event.stopPropagation();
  }

  if (disabled) {
    return (
      <span
        className={`${className} cursor-not-allowed opacity-50`}
        aria-disabled="true"
        title={unavailableLabel}
        onClick={stopContactPropagation}
        onMouseDown={stopContactPropagation}
      >
        {content}
      </span>
    );
  }

  return (
    <a
      href={href}
      onClick={(event) => {
        event.stopPropagation();
        emitAppToast({ message: resolvedToastMessage });
      }}
      onMouseDown={stopContactPropagation}
      className={className}
    >
      {content}
    </a>
  );
}
