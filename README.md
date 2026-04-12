# Rental Showing Agent Dashboard

A simple Next.js dashboard for tracking renter leads, scheduling showings, and building a daily showing route with a Google Maps directions link.

## Features

- Add new leads with contact details, property address, move-in date, notes, and status
- View all leads on a mobile-friendly dashboard
- Open a lead details page to update status and schedule a showing
- Group scheduled showings by day on the routes page
- Open a Google Maps directions link built from the scheduled property addresses
- Includes 5 demo leads in local JSON storage

## Tech Stack

- Next.js App Router
- Tailwind CSS
- Local JSON file storage in `data/leads.json`

## Run Locally

1. Open a terminal in:

```powershell
cd "C:\Users\ProBo\OneDrive\Documents\New project"
```

2. Install dependencies:

```powershell
npm install
```

3. Start the dev server:

```powershell
npm run dev
```

4. Open:

```text
http://localhost:3000
```

## Main Files

- Dashboard page: `app/page.tsx`
- New lead form page: `app/leads/new/page.tsx`
- Lead details and scheduling page: `app/leads/[id]/page.tsx`
- Route grouping page: `app/routes/page.tsx`
- Google Maps route link logic: `lib/storage.ts`
- Local data file with demo leads: `data/leads.json`
