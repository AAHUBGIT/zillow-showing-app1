"use client";

import { LoadingLink } from "@/components/loading-link";
export { emitPropertyFormDirtyChange, propertyFormDirtyEventName } from "@/components/property-form-dirty";

export function PropertyBackLink({
  href,
  scope,
  className = "app-button-secondary"
}: {
  href: string;
  scope: string;
  className?: string;
}) {
  return (
    <LoadingLink
      href={href}
      className={className}
      loadingLabel="Back to Customer..."
      dirtyScope={scope}
    >
      Back to Customer
    </LoadingLink>
  );
}
