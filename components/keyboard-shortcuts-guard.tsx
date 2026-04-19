"use client";

import { useEffect } from "react";

function isTextInputTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) {
    return true;
  }

  return target.isContentEditable;
}

export function KeyboardShortcutsGuard() {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const pressedSelectAll = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "a";

      if (!pressedSelectAll || isTextInputTarget(event.target)) {
        return;
      }

      event.preventDefault();
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, []);

  return null;
}
