# Rental Showing Agent CRM

A premium, investor-demo-ready real estate CRM for rental showing agents and leasing coordinators. The app helps agents capture leads, rank urgency, plan follow-ups, schedule tours, track multiple property options per customer, open Google Calendar events, and organize routes from one polished operations dashboard.

## What The App Does

- Protects the app behind a simple login
- Tracks renter leads in a premium CRM-style dashboard
- Treats each lead as a customer record with multiple interested properties
- Lets agents create, update, prioritize, and schedule leads
- Highlights lead source, follow-up pressure, and showing activity
- Tracks listing-by-listing pros, cons, notes, rating, and touring status
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
- Browser-picker-friendly showing date/time inputs with manual entry validation
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
- Multi-property customer workflow:
  - each lead can track multiple interested properties
  - customer page shows property cards
  - add-property flow for expanding the shortlist
  - property report page with status, notes, rating, listing link, and Google Maps
- Routes page with grouped daily showings
- Copy route link and Google Maps route open action
- Toast notifications for important actions
- Prisma + SQLite local database
- Vercel-safe demo-data preview fallback
- Intelligent lead sorting based on urgency and schedule timing
- Inline form validation with accessible error states

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
APP_PREVIEW_MODE="off"
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

## Preview Mode Toggle

Use `APP_PREVIEW_MODE` to simulate the hosted preview experience locally.

```text
APP_PREVIEW_MODE="off"
```

- `off`: normal local mode with Prisma + SQLite writes enabled
- `readonly`: forces preview mode locally so create/update actions are disabled and preview banners appear

If `APP_PREVIEW_MODE` is unset, the app still automatically falls back to read-only preview mode on Vercel when no hosted database is configured.

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
- The dashboard and lead forms also show a persistent preview banner when writes are disabled

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
- Lead creation and lead-detail updates are disabled in preview mode
- Dashboard status changes still explain that preview mode is read-only instead of silently failing
- The UI still works normally for demo and evaluation
- Google Calendar links still work from demo data
- Routes still work from demo data

## Testing Date, Time, And Validation Locally

1. Run the app locally:

```powershell
cd "C:\Users\ProBo\OneDrive\Documents\New project"
npm run dev
```

2. Open `/leads/new` and `/leads/[id]`.
3. In the showing date and time fields:
   - click `Use picker` to open the browser-native picker
   - type `MM/DD/YYYY` for date input
   - type `h:mm AM/PM` for time input, like `9:30 AM`
4. Leave required fields empty to see inline validation errors.
5. Set `APP_PREVIEW_MODE="readonly"` in `.env`, restart the dev server, and confirm:
   - the preview banner appears on the dashboard and lead form pages
   - `Create Lead` and `Update Lead` are disabled
   - the disabled buttons explain why on hover or keyboard focus

## Main App Areas

- App shell and sticky header: `components/app-header.tsx`
- Login page: `app/login/page.tsx`
- Dashboard loader: `app/page.tsx`
- Dashboard CRM UI: `components/dashboard-client.tsx`
- Lead cards: `components/lead-card.tsx`
- New lead form: `app/leads/new/page.tsx`
- Lead details workspace: `app/leads/[id]/page.tsx`
- Add-property page: `app/leads/[id]/properties/new/page.tsx`
- Property report page: `app/leads/[id]/properties/[propertyId]/page.tsx`
- Routes dashboard: `app/routes/page.tsx`
- Toast system: `components/toast-viewport.tsx`
- Authentication helpers: `lib/auth.ts`
- Lead sorting and CRM helpers: `lib/lead-utils.ts`
- Lead create/update actions: `lib/actions.ts`
- Property status and sorting helpers: `lib/property-interest-utils.ts`
- Scheduling input UX: `components/date-time-picker-fields.tsx`
- Prisma access: `lib/prisma.ts`
- Lead query helpers and route logic: `lib/storage.ts`
- Prisma schema: `prisma/schema.prisma`
- Prisma seed script: `prisma/seed.js`
- Demo seed data: `data/leads.json`

## Notes

- Runtime lead data is stored in SQLite through Prisma
- Each lead owns many related `PropertyInterest` records in SQLite through Prisma
- `data/leads.json` is the seed source for demo leads and preview fallback data
- Leads are sorted by priority, follow-up urgency, upcoming showing, and recent activity
- Property cards are sorted with active listings first, then stronger-rated options, then most recent updates
- Priority, source, and next follow-up date are stored in SQLite through Prisma
- Preview mode can be toggled locally with `APP_PREVIEW_MODE`
- The app was verified successfully with `npm run build`

## Multi-Property Workflow Test

1. Start the app locally:

```powershell
cd "C:\Users\ProBo\OneDrive\Documents\New project"
npm run dev
```

2. Sign in with the demo credentials.
3. Open any lead from the dashboard.
4. On the customer detail page:
   - confirm the `Interested Properties` section shows multiple property cards
   - click `Add Property`
5. Add a new property with title, address, status, source, and notes.
6. Return to the customer page and confirm the new property appears in the shortlist.
7. Open a property report and confirm you can:
   - open the listing link
   - open the address in Google Maps
   - mark the property as toured
   - update the status, rating, pros, cons, and notes
8. Return to the customer page and confirm active properties remain near the top while rejected and closed properties fall lower.
