import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { Suspense } from "react";
import { AppHeader } from "@/components/app-header";
import { ToastViewport } from "@/components/toast-viewport";
import { getSessionUser } from "@/lib/auth";
import { isPreviewReadonlyMode } from "@/lib/deployment";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap"
});

export const metadata: Metadata = {
  title: "Showing Agent Dashboard",
  description: "Simple rental lead dashboard for showings and routes."
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
        <div className="app-shell">
          <AppHeader isPreviewReadonly={previewReadonly} sessionUser={sessionUser} />

          <div className="pb-8">{children}</div>
        </div>
        <Suspense>
          <ToastViewport />
        </Suspense>
      </body>
    </html>
  );
}
