"use client";

import { ButtonHTMLAttributes } from "react";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const [isPending, setIsPending] = useState(false);
  const isCurrentPath = pathname === href;

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

        if (isPending || isCurrentPath) {
          return;
        }

        setIsPending(true);

        // Use a full document navigation for reliability across protected routes,
        // auth redirects, and Vercel deployment aliases.
        window.location.assign(href);
      }}
      className={`${className} ${isCurrentPath ? "cursor-default" : ""} disabled:cursor-progress disabled:opacity-75`}
    >
      {isPending ? <InlineSpinner /> : null}
      <span>{isPending ? loadingLabel || "Opening..." : children}</span>
    </button>
  );
}
