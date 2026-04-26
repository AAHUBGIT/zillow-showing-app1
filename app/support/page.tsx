export default function SupportPage() {
  return (
    <main className="mx-auto max-w-4xl space-y-6">
      <section className="app-panel p-5 sm:p-6">
        <p className="app-eyebrow">Support</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Showings CRM Support
        </h2>
        <p className="app-copy mt-3">
          Need help during beta? Start here with the most common support paths for access,
          workflow questions, and route planning.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <SupportCard
          title="Beta Access"
          body="If you cannot sign in, confirm you are using the beta access email and password shared with your team."
        />
        <SupportCard
          title="Leads and Properties"
          body="Use the dashboard for pipeline triage, then open a customer profile to manage interested properties and showing details."
        />
        <SupportCard
          title="Routes"
          body="Scheduled showings with a date, time, and property address appear on the Routes page and in Today."
        />
        <SupportCard
          title="Contact"
          body="For beta feedback, share the page you were on, what you expected, and what happened so the issue can be reproduced."
        />
      </section>
    </main>
  );
}

function SupportCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="app-panel p-5">
      <h3 className="text-base font-semibold tracking-tight text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
    </div>
  );
}
