export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl space-y-6">
      <section className="app-panel p-5 sm:p-6">
        <p className="app-eyebrow">Privacy</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Showings CRM Privacy
        </h2>
        <p className="app-copy mt-3">
          This page summarizes how Showings CRM handles information used to organize leads,
          showings, routes, properties, and follow-ups inside the workspace.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="app-chip">Showings CRM</span>
          <span className="app-chip">Rental showing workspace</span>
        </div>
      </section>

      <section className="app-panel p-5 sm:p-6">
        <div className="grid gap-4">
          <PolicyBlock
            title="Customer Data"
            body="Lead names, contact details, property addresses, follow-up dates, and showing notes are used to run the CRM workflow inside the workspace."
          />
          <PolicyBlock
            title="Workspace Access"
            body="Access is intended for authorized workspace users. Avoid entering sensitive information that is not needed to manage a showing or follow-up."
          />
          <PolicyBlock
            title="Third-Party Links"
            body="Google Maps and Google Calendar links open outside Showings CRM. Those services apply their own privacy policies."
          />
          <PolicyBlock
            title="Questions"
            body="For privacy questions, contact support@showingscrm.com and include the workspace email you use to sign in."
          />
        </div>
      </section>
    </main>
  );
}

function PolicyBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-3xl border border-line/80 bg-white px-4 py-4 shadow-sm">
      <h3 className="text-base font-semibold tracking-tight text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
    </div>
  );
}
