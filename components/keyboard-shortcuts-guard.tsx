"use client";

import { useEffect } from "react";

function isTextInputTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  if (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  ) {
    return true;
  }

  if (target.closest("input, textarea, select, [role='textbox']")) {
    return true;
  }

  return target.isContentEditable || Boolean(target.closest("[contenteditable='true']"));
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
