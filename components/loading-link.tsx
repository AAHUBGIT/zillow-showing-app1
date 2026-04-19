"use client";

import { ButtonHTMLAttributes } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { InlineSpinner } from "@/components/inline-spinner";

export function LoadingLink({
  href,
  className,
  children,
  loadingLabel,
  ariaLabel,
  onClick,
  ...buttonProps
}: {
  href: string;
  className: string;
  children: React.ReactNode;
  loadingLabel?: string;
  ariaLabel?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setIsPending(false);
  }, [pathname]);

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-busy={isPending}
      disabled={isPending}
      {...buttonProps}
      onClick={(event) => {
        onClick?.(event);

        if (event.defaultPrevented) {
          return;
        }

        if (isPending) {
          return;
        }

        setIsPending(true);
        router.push(href);
      }}
      className={`${className} disabled:cursor-progress disabled:opacity-75`}
    >
      {isPending ? <InlineSpinner /> : null}
      <span>{isPending ? loadingLabel || "Opening..." : children}</span>
    </button>
  );
}
