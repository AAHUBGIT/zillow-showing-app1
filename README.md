# Rental Showing Agent CRM

A premium, investor-demo-ready real estate CRM for rental showing agents and leasing coordinators. The app helps agents capture leads, rank urgency, plan follow-ups, schedule tours, open Google Calendar events, and organize routes from one polished operations dashboard.

## What The App Does

- Protects the app behind a simple login
- Tracks renter leads in a premium CRM-style dashboard
- Lets agents create, update, prioritize, and schedule leads
- Highlights lead source, follow-up pressure, and showing activity
- Helps agents plan the day with grouped route views and Maps links
- Supports a lightweight Google Calendar handoff for scheduled showings

## Current Features

- Login and logout
- Protected routes and authenticated app shell
- Premium CRM dashboard with search and filtering
- Advanced filtering by status, priority, source, follow-up state, move-in date, and showing date
- Dashboard insight widgets:
  - total leads
  - scheduled showings
  - closed leads
  - overdue follow-ups
  - high-priority leads
  - showings happening today
  - showings in the next 7 days
- Lead creation form
- Lead priority:
  - low
  - medium
  - high
  - urgent
- Lead source:
  - Zillow
  - referral
  - Facebook
  - repeat client
  - phone inquiry
  - other
- Next follow-up date tracking
- Overdue/today/upcoming follow-up indicators
- Professional CRM lead cards with quick actions:
  - Call
  - Text
  - Email
- Direct status updates from the dashboard
- Lead details workspace with:
  - contact info
  - status
  - source
  - priority
  - notes
  - follow-up date
  - showing schedule
  - Google Calendar link
- Routes page with grouped daily showings
- Copy route link and Google Maps route open action
- Toast notifications for important actions
- Prisma + SQLite local database
- Vercel-safe demo-data preview fallback
- Intelligent lead sorting based on urgency and schedule timing

## Tech Stack

- Next.js App Router
- Tailwind CSS
- Prisma ORM
- SQLite
- Simple cookie-based authentication
- Beginner-friendly server actions

## Local Project Path

```text
C:\Users\ProBo\OneDrive\Documents\New project
```

## Demo Login Credentials

```text
Email: demo@showingscrm.com
Password: changeme123
```

## Local Setup

1. Open a terminal in the project folder:

```powershell
cd "C:\Users\ProBo\OneDrive\Documents\New project"
```

2. Install dependencies:

```powershell
npm install
```

3. Make sure your local auth/database settings exist in `.env` or `.env.local`:

```text
DATABASE_URL="file:../dev.db"
AUTH_EMAIL="demo@showingscrm.com"
AUTH_PASSWORD="changeme123"
AUTH_SECRET="replace-this-with-a-long-random-secret"
```

4. Generate the Prisma client:

```powershell
npm run prisma:generate
```

5. Apply Prisma migrations on a fresh local setup:

```powershell
npm run prisma:migrate
```

6. Seed the demo data:

```powershell
npm run prisma:seed
```

7. Start the app:

```powershell
npm run dev
```

8. Open the app:

```text
http://localhost:3000
```

9. Sign in using the demo credentials shown above.

## Prisma Commands

```powershell
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

## Free Vercel Preview Mode

This app is prepared for a simple free public preview on Vercel.

- Local development uses Prisma + SQLite
- Free Vercel preview uses demo-data fallback when no hosted database is configured
- The app still renders and can be demoed publicly
- Search, filters, routes, and Google Calendar links still work
- Write actions show a friendly read-only toast instead of crashing

## Vercel Deployment Steps

1. Push the project to GitHub.
2. Import the repository into [Vercel](https://vercel.com/).
3. Keep the default Next.js settings.
4. Add these environment variables in Vercel:

```text
AUTH_EMAIL=demo@showingscrm.com
AUTH_PASSWORD=changeme123
AUTH_SECRET=replace-this-with-a-long-random-secret
```

5. Deploy.
6. Open the preview URL and sign in with the same credentials.

## Preview-Mode Limitations

- Public preview mode is read-only when no hosted database is connected
- Lead creation, persistent status updates, and persistent scheduling are disabled in preview mode
- The UI still works normally for demo and evaluation
- Google Calendar links still work from demo data
- Routes still work from demo data

## Main App Areas

- App shell and sticky header: `components/app-header.tsx`
- Login page: `app/login/page.tsx`
- Dashboard loader: `app/page.tsx`
- Dashboard CRM UI: `components/dashboard-client.tsx`
- Lead cards: `components/lead-card.tsx`
- New lead form: `app/leads/new/page.tsx`
- Lead details workspace: `app/leads/[id]/page.tsx`
- Routes dashboard: `app/routes/page.tsx`
- Toast system: `components/toast-viewport.tsx`
- Authentication helpers: `lib/auth.ts`
- Lead sorting and CRM helpers: `lib/lead-utils.ts`
- Lead create/update actions: `lib/actions.ts`
- Prisma access: `lib/prisma.ts`
- Lead query helpers and route logic: `lib/storage.ts`
- Prisma schema: `prisma/schema.prisma`
- Prisma seed script: `prisma/seed.js`
- Demo seed data: `data/leads.json`

## Notes

- Runtime lead data is stored in SQLite through Prisma
- `data/leads.json` is the seed source for demo leads and preview fallback data
- Leads are sorted by priority, follow-up urgency, upcoming showing, and recent activity
- Priority, source, and next follow-up date are stored in SQLite through Prisma
- The app was verified successfully with `npm run build`
