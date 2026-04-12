import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Showing Agent Dashboard",
  description: "Simple rental lead dashboard for showings and routes."
};

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/leads/new", label: "New Lead" },
  { href: "/routes", label: "Routes" }
];

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="mx-auto min-h-screen max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="mb-6 overflow-hidden rounded-4xl border border-white/70 bg-white/80 shadow-panel backdrop-blur">
            <div className="flex flex-col gap-4 px-5 py-5 sm:px-8 sm:py-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.25em] text-accent">
                    Rental Showing Agent
                  </p>
                  <h1 className="mt-1 text-2xl font-semibold text-ink sm:text-3xl">
                    Lead Tracking Made Simple
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
                    Add leads, schedule showings, and build a clean daily route from one
                    beginner-friendly dashboard.
                  </p>
                </div>
                <Link
                  href="/leads/new"
                  className="inline-flex items-center justify-center rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Add New Lead
                </Link>
              </div>

              <nav className="flex flex-wrap gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-accent hover:text-accent"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {children}
        </div>
      </body>
    </html>
  );
}
