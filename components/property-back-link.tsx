"use client";

import { useEffect, useState } from "react";
import { LoadingLink } from "@/components/loading-link";

export const propertyFormDirtyEventName = "property-form-dirty-change";

export function emitPropertyFormDirtyChange(scope: string, isDirty: boolean) {
  window.dispatchEvent(
    new CustomEvent(propertyFormDirtyEventName, {
      detail: { scope, isDirty }
    })
  );
}

export function PropertyBackLink({
  href,
  scope,
  className = "app-button-secondary"
}: {
  href: string;
  scope: string;
  className?: string;
}) {
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    function handleDirtyChange(event: Event) {
      const customEvent = event as CustomEvent<{ scope?: string; isDirty?: boolean }>;

      if (customEvent.detail?.scope === scope) {
        setIsDirty(Boolean(customEvent.detail.isDirty));
      }
    }

    window.addEventListener(propertyFormDirtyEventName, handleDirtyChange as EventListener);
    return () => {
      window.removeEventListener(propertyFormDirtyEventName, handleDirtyChange as EventListener);
    };
  }, [scope]);

  return (
    <LoadingLink
      href={href}
      className={className}
      loadingLabel="Back to Customer..."
      onClick={(event) => {
        if (isDirty && !window.confirm("Discard unsaved property details?")) {
          event.preventDefault();
        }
      }}
    >
      Back to Customer
    </LoadingLink>
  );
}
