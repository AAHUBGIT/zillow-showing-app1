"use client";

import { useFormStatus } from "react-dom";
import { InlineSpinner } from "@/components/inline-spinner";

export function MarkFollowUpCompleteButton({ disabled = false }: { disabled?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="app-button-secondary min-h-[42px] px-4 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-55"
    >
      {pending ? (
        <>
          <InlineSpinner />
          <span>Marking...</span>
        </>
      ) : (
        "Mark followed up"
      )}
    </button>
  );
}
