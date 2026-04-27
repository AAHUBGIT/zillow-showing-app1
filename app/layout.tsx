import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { Suspense } from "react";
import { AppFooter } from "@/components/app-footer";
import { AppHeader } from "@/components/app-header";
import { KeyboardShortcutsGuard } from "@/components/keyboard-shortcuts-guard";
import { ToastViewport } from "@/components/toast-viewport";
import { getSessionUser } from "@/lib/auth";
import { isPreviewReadonlyMode } from "@/lib/deployment";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap"
});

export const metadata: Metadata = {
  title: "Showings CRM",
  description: "A private workspace for rental leads, showings, routes, properties, and follow-ups."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const previewReadonly = isPreviewReadonlyMode();
  const sessionUser = await getSessionUser();

  return (
    <html lang="en">
      <body className={manrope.className}>
        <KeyboardShortcutsGuard />
        <div className="app-shell">
          <a
            href="#main-content"
            className="sr-only absolute left-4 top-4 z-[70] rounded-full bg-ink px-4 py-3 text-sm font-semibold text-white focus:not-sr-only"
          >
            Skip to main content
          </a>

          <AppHeader isPreviewReadonly={previewReadonly} sessionUser={sessionUser} />

          <div id="main-content" tabIndex={-1} className="pb-8">
            {children}
          </div>

          <AppFooter />
        </div>
        <Suspense>
          <ToastViewport />
        </Suspense>
      </body>
    </html>
  );
}
