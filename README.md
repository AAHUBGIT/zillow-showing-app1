# Showings CRM

Showings CRM is a beta real estate SaaS workspace for rental showing agents and leasing teams. It helps agents manage leads, customer profiles, interested properties, comparisons, showing schedules, route planning, follow-ups, and field-ready contact actions from one product.

Current beta URL:

```text
https://zillow-showing-app1.vercel.app
```

The app is still using the Vercel URL for beta testing. Do not add a custom domain yet.

## What The App Does

- Protects the workspace behind login
- Tracks renter leads and customer profiles
- Supports multiple interested properties per customer
- Compares property options
- Schedules showings and follow-ups
- Opens Google Maps route and property links
- Creates Google Calendar event links
- Provides AI-style customer and property insights
- Manages property workflow stages
- Reorders route stops and persists the saved order
- Gives agents a daily operating screen at `/today`

## Today Command Center

The Today page is the agent's daily operating screen.

It shows:

- Today's showings sorted by showing time
- Quick actions for View Lead, Call, Text, Email, and Open Maps
- Overdue follow-ups sorted oldest first
- Follow-ups due today with priority and status
- High-priority open leads
- A snapshot of today's route stops with a link to Routes
- Summary cards for showings, overdue follow-ups, follow-ups due today, and high-priority open leads

The page uses existing lead fields:

- `showingDate`
- `showingTime`
- `propertyAddress`
- `nextFollowUpDate`
- `priority`
- `status`
- `phone`
- `email`

No new database tables are required for the Today page.

## Core Features

- Login and logout
- Authenticated app shell
- Lead dashboard with search and filters
- Lead creation and editing
- Customer profile pages
- Property creation and editing
- Property comparison view
- Property workflow actions
- Showing schedule form
- Google Calendar event links
- Google Maps links
- Daily route planner
- Route stop reorder, completion, and notes
- Today Command Center
- Toast notifications
- Mobile-friendly action buttons

## Tech Stack

- Next.js App Router
- React
- Tailwind CSS
- Prisma ORM
- SQLite for local development
- Hosted Postgres for beta production
- Cookie-based authentication
- Server actions for mutations

## Beta Access

Default beta access values can be configured through environment variables.

```text
Email: demo@showingscrm.com
Password: changeme123
```

## Local Setup

Project path:

```text
C:\projects\zillowapp1
```

Install dependencies:

```powershell
npm install
```

Create or update `.env`:

```text
APP_RUNTIME_MODE="local"
SQLITE_DATABASE_URL="file:../dev.db"
POSTGRES_DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
AUTH_EMAIL="demo@showingscrm.com"
AUTH_PASSWORD="changeme123"
AUTH_SECRET="replace-this-with-a-long-random-secret"
```

Generate Prisma clients:

```powershell
npm run prisma:generate
```

Apply local migrations on a fresh setup:

```powershell
npm run prisma:migrate
```

Seed sample data if needed:

```powershell
npm run prisma:seed
```

Start the app:

```powershell
npm run dev
```

Open:

```text
http://localhost:3000
```

## Runtime Modes

`APP_RUNTIME_MODE` controls the active data mode:

- `local`: uses SQLite through `SQLITE_DATABASE_URL`
- `preview`: uses bundled sample data and disables writes
- `production`: uses hosted Postgres through `POSTGRES_DATABASE_URL`

## Hosted Postgres Setup

For the editable beta deployment:

1. Create a hosted Postgres database.
2. Set `APP_RUNTIME_MODE="production"`.
3. Set `POSTGRES_DATABASE_URL`.
4. Set `AUTH_EMAIL`, `AUTH_PASSWORD`, and `AUTH_SECRET`.
5. Generate both Prisma clients.
6. Push the Postgres schema.

```powershell
npm run prisma:generate
npm run prisma:push:postgres
```

Seed sample records into hosted Postgres only if you want a preloaded workspace:

```powershell
npm run prisma:seed:postgres
```

## Vercel Beta Deployment

1. Push the repository to GitHub.
2. Import the repository into Vercel.
3. Keep the default Next.js settings.
4. Add the production environment variables.
5. Deploy.

Required production variables:

```text
APP_RUNTIME_MODE=production
POSTGRES_DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require
AUTH_EMAIL=demo@showingscrm.com
AUTH_PASSWORD=changeme123
AUTH_SECRET=replace-this-with-a-long-random-secret
```

## Prisma Commands

```powershell
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run prisma:push:postgres
npm run prisma:seed:postgres
```

## Verification Checklist

- Log in with beta access credentials
- Open `/today` and confirm today's showings, follow-ups, high-priority leads, and route snapshot
- Open the dashboard and confirm leads, filters, and summary cards still work
- Create or update a showing and confirm it appears in Routes and Today when scheduled for today
- Reorder route stops and refresh to confirm the order persists
- Open Privacy, Terms, and Support from the footer
- Run `npm run build`
