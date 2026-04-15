import { loginUser } from "@/lib/actions";

export default function LoginPage({
  searchParams
}: {
  searchParams?: { next?: string; toast?: string };
}) {
  const next = searchParams?.next || "/";

  return (
    <main className="mx-auto max-w-5xl">
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="app-panel p-6 sm:p-8">
          <div>
            <p className="app-eyebrow">Secure Login</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">
              Sign in to your showing CRM
            </h1>
            <p className="app-copy mt-3">
              Use the simple demo credentials from your local environment to access the dashboard.
            </p>
          </div>

          <form action={loginUser} className="mt-8 grid gap-5">
            <input type="hidden" name="next" value={next} />

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <input
                type="email"
                name="email"
                className="app-input"
                placeholder="demo@showingscrm.com"
                required
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">Password</span>
              <input
                type="password"
                name="password"
                className="app-input"
                placeholder="Enter your password"
                required
              />
            </label>

            <div className="rounded-3xl border border-line/80 bg-slate-50/80 p-4">
              <p className="app-kicker">Local Demo Defaults</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Email: <span className="font-semibold text-ink">demo@showingscrm.com</span>
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Password: <span className="font-semibold text-ink">changeme123</span>
              </p>
            </div>

            <button type="submit" className="app-button-primary">
              Login
            </button>
          </form>
        </div>

        <div className="app-panel overflow-hidden p-6 sm:p-8">
          <div className="relative isolate h-full rounded-4xl bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(37,99,235,0.88))] p-6 text-white shadow-panel">
            <div className="absolute right-0 top-0 -z-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-0 left-8 -z-10 h-32 w-32 rounded-full bg-blue-300/20 blur-3xl" />

            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-100">
              Investor-demo ready
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              A premium operating system for showings and lead conversion.
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-200">
              Keep inquiry intake, follow-up pressure, tour scheduling, and route planning inside a
              single clean workspace.
            </p>

            <div className="mt-8 grid gap-3">
              <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Pipeline</p>
                <p className="mt-2 text-base font-semibold">Priorities, sources, and next steps</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Scheduling</p>
                <p className="mt-2 text-base font-semibold">Tours, follow-ups, routes, calendar</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Ops</p>
                <p className="mt-2 text-base font-semibold">Fast enough for the field, clean enough to demo</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
