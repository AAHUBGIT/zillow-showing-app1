import Link from "next/link";
import { getLeadCapturePageData } from "@/lib/lead-capture";
import type { LeadCaptureRecent } from "@/lib/lead-capture";

const workflowCards = [
  {
    title: "Forward rental inquiries",
    body: "Send Zillow, portal, or rental inquiry emails to the assigned Showings CRM inbox."
  },
  {
    title: "Auto-detect renter details",
    body: "Extract renter name, phone, email, message, source, and the requested property."
  },
  {
    title: "Create lead and interested property",
    body: "Create the lead profile and first interested property when the capture is confident."
  },
  {
    title: "Deduplicate by email/phone",
    body: "Match inbound emails to existing leads before creating another record."
  },
  {
    title: "Send new captures to Dashboard and Today",
    body: "Surface captured leads where agents already manage daily follow-up."
  }
];

const comingNextItems = [
  "unique inbox per user",
  "inbound email webhook",
  "Postmark/SendGrid/Mailgun provider setup",
  "Gmail/Outlook forwarding instructions"
];

const statusTone: Record<LeadCaptureRecent["parseStatus"], string> = {
  SUCCESS: "border-emerald-200 bg-emerald-50 text-emerald-700",
  LOW_CONFIDENCE: "border-amber-200 bg-amber-50 text-amber-700",
  DUPLICATE: "border-blue-200 bg-blue-50 text-blue-700",
  FAILED: "border-rose-200 bg-rose-50 text-rose-700"
};

function formatCaptureDate(value: string) {
  if (!value) {
    return "Recently";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function formatStatus(value: LeadCaptureRecent["parseStatus"]) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default async function LeadCapturePage() {
  const { inboxEmail, recentCaptures } = await getLeadCapturePageData();

  return (
    <main className="space-y-6">
      <section className="app-panel overflow-hidden">
        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_360px] lg:p-8">
          <div>
            <p className="app-eyebrow">Lead Capture</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Lead Capture Inbox
            </h1>
            <p className="app-copy mt-3 max-w-3xl">
              Each agent gets a unique Showings CRM lead inbox. Forward Zillow, portal, or
              rental inquiry emails to that inbox and Showings CRM will parse the email and
              create the lead and interested property automatically.
            </p>
            <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
              <div className="rounded-2xl border border-line bg-white px-4 py-3">
                No Apps Script required per account.
              </div>
              <div className="rounded-2xl border border-line bg-white px-4 py-3">
                No manual paste required.
              </div>
              <div className="rounded-2xl border border-line bg-white px-4 py-3">
                No Zillow scraping.
              </div>
            </div>
          </div>

          <aside className="rounded-3xl border border-line bg-white p-5 shadow-soft">
            <p className="app-kicker">Beta inbox</p>
            <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm font-semibold text-ink">
              {inboxEmail}
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              This placeholder address shows the intended forwarding workflow. Real provider
              delivery will connect through the inbound email webhook.
            </p>
          </aside>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {workflowCards.map((card) => (
          <div key={card.title} className="app-grid-card">
            <h2 className="text-sm font-semibold text-ink">{card.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{card.body}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="app-panel p-5 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="app-eyebrow">Recent Captures</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink">
                Inbound email activity
              </h2>
            </div>
          </div>

          {recentCaptures.length ? (
            <div className="mt-5 divide-y divide-line overflow-hidden rounded-3xl border border-line bg-white">
              {recentCaptures.map((capture) => (
                <article key={capture.id} className="p-4 sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                            statusTone[capture.parseStatus]
                          }`}
                        >
                          {formatStatus(capture.parseStatus)}
                        </span>
                        <span className="text-xs font-medium text-slate-500">
                          {formatCaptureDate(capture.createdAt)}
                        </span>
                      </div>
                      <h3 className="mt-3 truncate text-sm font-semibold text-ink">
                        {capture.subject || "Inbound rental inquiry"}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">
                        From {capture.fromEmail || "unknown sender"}
                      </p>
                      {capture.errorMessage ? (
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {capture.errorMessage}
                        </p>
                      ) : null}
                    </div>

                    {capture.parsedLeadId ? (
                      <Link
                        href={`/leads/${capture.parsedLeadId}`}
                        className="app-button-secondary min-h-[40px] px-4 py-2"
                      >
                        {capture.parsedLeadName || "Open lead"}
                      </Link>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-3xl border border-dashed border-line bg-white/80 p-6 text-sm text-slate-600">
              No captured leads yet.
            </div>
          )}
        </div>

        <aside className="app-panel p-5 sm:p-6">
          <p className="app-eyebrow">Coming Next</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink">
            Provider setup
          </h2>
          <ul className="mt-4 space-y-3">
            {comingNextItems.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-line bg-white px-4 py-3 text-sm font-medium text-slate-700"
              >
                {item}
              </li>
            ))}
          </ul>
        </aside>
      </section>
    </main>
  );
}
