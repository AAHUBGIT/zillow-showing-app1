"use client";

export function CopyRouteButton({ link }: { link: string }) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      window.dispatchEvent(
        new CustomEvent("app-toast", {
          detail: { toastKey: "route-copied" }
        })
      );
    } catch {
      window.dispatchEvent(
        new CustomEvent("app-toast", {
          detail: { message: "Could not copy the route link." }
        })
      );
    }
  };

  return (
    <button type="button" onClick={handleCopy} className="app-button-secondary">
      Copy Route Link
    </button>
  );
}
