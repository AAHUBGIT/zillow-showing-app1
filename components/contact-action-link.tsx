"use client";

import { emitAppToast } from "@/lib/client-toast";

export function ContactActionLink({
  href,
  label,
  toastMessage,
  disabled = false,
  disabledLabel,
  className = "app-button-secondary min-h-[48px] px-4 py-2.5"
}: {
  href: string;
  label: string;
  toastMessage: string;
  disabled?: boolean;
  disabledLabel: string;
  className?: string;
}) {
  if (disabled) {
    return (
      <span className={`${className} cursor-not-allowed opacity-50`} aria-disabled="true">
        {disabledLabel}
      </span>
    );
  }

  return (
    <a
      href={href}
      onClick={() => emitAppToast({ message: toastMessage })}
      className={className}
    >
      {label}
    </a>
  );
}
