"use client";

export const propertyFormDirtyEventName = "property-form-dirty-change";

const dirtyPropertyScopes = new Map<string, boolean>();

export function emitPropertyFormDirtyChange(scope: string, isDirty: boolean) {
  if (isDirty) {
    dirtyPropertyScopes.set(scope, true);
  } else {
    dirtyPropertyScopes.delete(scope);
  }

  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(propertyFormDirtyEventName, {
      detail: { scope, isDirty }
    })
  );
}

export function hasDirtyPropertyForm(scope?: string) {
  if (scope) {
    return dirtyPropertyScopes.get(scope) === true;
  }

  return Array.from(dirtyPropertyScopes.values()).some(Boolean);
}

export function confirmDiscardPropertyFormChanges(scope?: string) {
  if (!hasDirtyPropertyForm(scope)) {
    return true;
  }

  if (typeof window === "undefined") {
    return true;
  }

  return window.confirm("Discard unsaved property details?");
}
