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
- Strong client-side validation with inline error messages
- Disabled save actions until forms are valid
- Loading states for navigation, form saves, logout, and inline status updates
- Auto-resizing notes fields and safer text limits for CRM inputs
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
  - customer page groups active properties at the top
  - rejected properties stay available in a collapsed section
  - top-rated property is highlighted on the customer record
  - property cards show rent, layout, neighborhood, status, rating, and feedback
  - add-property flow for expanding the shortlist
  - property report page with status, rating, feedback, schedule, listing link, and Google Maps
  - quick property actions:
    - mark toured
    - mark rejected
    - mark applying
    - schedule showing with a suggested date/time
- Routes page with grouped daily showings
- Copy route link and Google Maps route open action
- Toast notifications for important actions
- Prisma with SQLite local mode and hosted Postgres production mode
- Explicit preview/demo mode for read-only public demos
- Intelligent lead sorting based on urgency and schedule timing
- Inline form validation with accessible error states

## Tech Stack

- Next.js App Router
- Tailwind CSS
- Prisma ORM
- SQLite for local development
- Hosted Postgres for editable production deployments
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
APP_RUNTIME_MODE="local"
SQLITE_DATABASE_URL="file:../dev.db"
POSTGRES_DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
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

## Environment Modes

Use `APP_RUNTIME_MODE` to choose exactly how the app runs:

```text
APP_RUNTIME_MODE="local"
```

- `local`: uses SQLite through `SQLITE_DATABASE_URL` and keeps local development editable
- `preview`: uses bundled demo data only and disables writes for public demos
- `production`: uses hosted Postgres through `POSTGRES_DATABASE_URL` and enables real edits

Preview mode is now explicit. The app only uses demo/read-only mode when you set `APP_RUNTIME_MODE="preview"`.

## Environment Variables

Local development:

```text
APP_RUNTIME_MODE="local"
SQLITE_DATABASE_URL="file:../dev.db"
POSTGRES_DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
AUTH_EMAIL="demo@showingscrm.com"
AUTH_PASSWORD="changeme123"
AUTH_SECRET="replace-this-with-a-long-random-secret"
```

Hosted production on Vercel:

```text
APP_RUNTIME_MODE="production"
POSTGRES_DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
AUTH_EMAIL="demo@showingscrm.com"
AUTH_PASSWORD="changeme123"
AUTH_SECRET="replace-this-with-a-long-random-secret"
```

Explicit read-only preview:

```text
APP_RUNTIME_MODE="preview"
AUTH_EMAIL="demo@showingscrm.com"
AUTH_PASSWORD="changeme123"
AUTH_SECRET="replace-this-with-a-long-random-secret"
```

## Prisma Commands

```powershell
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run prisma:push:postgres
npm run prisma:seed:postgres
```

## Hosted Postgres Setup

This app now supports a real editable production deployment with hosted Postgres while keeping local SQLite development.

1. Create a hosted Postgres database.
   Good beginner-friendly options: Vercel Postgres, Neon, Supabase, or any standard Postgres provider.
2. Copy the direct Postgres connection string.
3. Set `APP_RUNTIME_MODE="production"`.
4. Set `POSTGRES_DATABASE_URL` to that hosted connection string.
5. Generate both Prisma clients:

```powershell
npm run prisma:generate
```

6. Push the Prisma schema to the hosted database:

```powershell
npm run prisma:push:postgres
```

7. Seed demo data into hosted Postgres if you want a preloaded editable CRM:

```powershell
npm run prisma:seed:postgres
```

## Vercel Deployment Steps

1. Push the project to GitHub.
2. Import the repository into [Vercel](https://vercel.com/).
3. Keep the default Next.js settings.
4. Add these environment variables in Vercel:

```text
APP_RUNTIME_MODE=production
POSTGRES_DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require
AUTH_EMAIL=demo@showingscrm.com
AUTH_PASSWORD=changeme123
AUTH_SECRET=replace-this-with-a-long-random-secret
```

5. Before or after the first deploy, run the hosted database setup from your local terminal:

```powershell
cd "C:\Users\ProBo\OneDrive\Documents\New project"
npm run prisma:generate
npm run prisma:push:postgres
npm run prisma:seed:postgres
```

6. Deploy.
7. Open the deployed URL and sign in with the same credentials.

With `APP_RUNTIME_MODE=production`, the deployed app is editable:
- lead creation and lead updates save
- property interest changes save
- status and scheduling updates save
- route completion and route notes save

## Preview-Mode Limitations

- Preview mode is read-only only when `APP_RUNTIME_MODE="preview"`
- Lead creation, lead-detail updates, and property saves are disabled in preview mode
- Dashboard status changes still explain that preview mode is read-only instead of silently failing
- The UI still works normally for demo and evaluation
- Google Calendar links still work from demo data
- Routes still work from demo data
- A persistent banner appears on dashboard and form pages: `Preview mode — changes are not saved`

## Validation And Input Rules

- Required lead fields:
  - full name
  - email
  - phone
  - property address
  - desired move-in date
  - status
  - priority
  - source
- Email must be in a normal email format like `name@example.com`
- Phone accepts common US-friendly formatting, but it still needs a valid 10-digit US number
- Property `rent`, `beds`, and `baths` must be numeric if you fill them in
- Showing time uses `h:mm AM/PM`
- Showing date uses `MM/DD/YYYY` in the visible field and the browser date picker behind the scenes
- Past showing dates trigger a warning and require explicit confirmation before save
- Save buttons stay disabled until the form is valid
- Notes, agent notes, names, addresses, and other text fields now have max-length protection to prevent oversized entries
- Property status now supports:
  - interested
  - scheduled
  - toured
  - rejected
  - applying
  - approved

## Testing Date, Time, And Validation Locally

1. Run the app locally:

```powershell
cd "C:\Users\ProBo\OneDrive\Documents\New project"
npm run dev
```

2. Open `/leads/new`, any lead details page, and any property form page.
3. In the showing date and time fields:
   - click into the field and confirm the browser picker opens
   - click the calendar or time icon and confirm the picker opens
   - type `MM/DD/YYYY` for date input
   - type `h:mm AM/PM` for time input, like `9:30 AM`
   - try an invalid time like `25:61` and confirm the inline error appears
   - try a past date and confirm the warning/confirmation appears
4. Leave required fields empty to see inline validation errors under the field.
5. Try invalid values:
   - bad email
   - short phone number
   - letters in `rent`, `beds`, or `baths`
6. Confirm the save button stays disabled until the form becomes valid.
7. Confirm notes fields grow as you type instead of forcing a tiny fixed box.
8. Confirm header links, record buttons, and save buttons show a loading state and do not double-submit.
9. Set `APP_RUNTIME_MODE="preview"` in `.env`, restart the dev server, and confirm:
   - the preview banner appears on the dashboard and lead form pages
   - `Create Lead`, `Update Lead`, and property save buttons are disabled
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
- Prisma schema (SQLite local): `prisma/schema.prisma`
- Prisma schema (Postgres hosted): `prisma/schema.postgres.prisma`
- Prisma seed script: `prisma/seed.js`
- Demo seed data: `data/leads.json`

## Notes

- Runtime lead data is stored through Prisma with SQLite in local mode and hosted Postgres in production mode
- Each lead owns many related `PropertyInterest` records through Prisma in both local and production modes
- `data/leads.json` is the seed source for demo leads and preview fallback data
- Leads are sorted by priority, follow-up urgency, upcoming showing, and recent activity
- Property cards are sorted with active listings first, then stronger-rated options, then most recent updates
- Priority, source, and next follow-up date are stored in Prisma-backed lead records in both SQLite and Postgres
- Preview mode can be toggled explicitly with `APP_RUNTIME_MODE="preview"`
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
   - confirm the `Interested Properties` section now separates active properties from rejected ones
   - confirm the top-rated property is highlighted
   - click `Add Property`
5. Add a new property with title, address, source, rating, and optional showing date/time.
6. Return to the customer page and confirm the new property appears in the active shortlist.
7. Open a property report and confirm you can:
   - open the listing link
   - open the address in Google Maps
   - mark the property as toured
   - mark the property as rejected
   - move the property to applying
   - schedule a showing with the suggested date/time button
   - update status, client feedback, agent feedback, rating, pros, cons, and schedule from the form
8. Return to the customer page and confirm:
   - active properties stay at the top
   - rejected properties move into the collapsed rejected section
   - approved and scheduled properties still remain easy to scan in the active group
