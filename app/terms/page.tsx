export default function TermsPage() {
  return (
    <main className="mx-auto max-w-4xl space-y-6">
      <section className="app-panel p-5 sm:p-6">
        <p className="app-eyebrow">Terms</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Showings CRM Beta Terms
        </h2>
        <p className="app-copy mt-3">
          These beta terms summarize how Showings CRM should be used while the product is being
          tested and refined.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="app-chip">Showings CRM beta</span>
          <span className="app-chip">Current beta URL</span>
        </div>
      </section>

      <section className="app-panel p-5 sm:p-6">
        <div className="grid gap-4">
          <TermsBlock
            title="Beta Product"
            body="Showings CRM is available for beta testing at the current Vercel beta URL. Product details may change as workflows and copy are refined."
          />
          <TermsBlock
            title="Authorized Use"
            body="Use the workspace only for rental showing operations, lead follow-up, property tracking, and route planning."
          />
          <TermsBlock
            title="External Services"
            body="Map, calendar, phone, text, and email actions rely on your device or third-party services. Showings CRM provides links, not a full external account sync."
          />
          <TermsBlock
            title="Availability"
            body="During beta, features may be adjusted or temporarily unavailable while the workspace is improved. Report access issues through Support."
          />
        </div>
      </section>
    </main>
  );
}

function TermsBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-3xl border border-line/80 bg-white px-4 py-4 shadow-sm">
      <h3 className="text-base font-semibold tracking-tight text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
    </div>
  );
}
