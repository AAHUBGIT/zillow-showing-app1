# Showings CRM Workflow Bugs

Last updated: 2026-05-13

This file tracks known QA-reported workflow bugs and product friction that should be fixed or re-tested in future passes. Do not treat this as a feature roadmap; it is the active quality backlog.

## This Pass - 2026-05-13

Fixed or improved:

- Made Compact density materially tighter across panels, subpanels, grid cards, form controls, dashboard cards, and section spacing.
- Tightened Dashboard filters and moved less-common filters into a compact "More filters" area.
- Tightened New Lead spacing and kept optional Preferences & Pre-screening plus Optional first showing setup collapsed by default.
- Confirmed by code review that Optional first showing setup supports inventory property selection, date/time, and notes without removing typed values on collapse.
- Reduced Lead Detail bulk with tighter section spacing and smaller showing/property panels.
- Made Communication Center more action-oriented by reducing form height, moving outcome notes behind an expandable control, compacting contact/log buttons, and keeping recent activity limited by default.
- Replaced inline Today/Routes showing lifecycle expansion with a fixed quick-actions dialog to avoid card clipping and height jumps.

Still needs QA:

- Production smoke test after Vercel deploy for Dashboard, Today, Routes, Properties, Lead Detail, New Lead, and Communication.
- Route Day Run Mode was deferred. It should be the next build after this stabilization pass if beta users still need a route-day execution screen.

## Open Bugs / UX Issues

## Follow-Up Queue Foundation - 2026-05-18

Added:

- Today follow-up cards now behave more like a queue, with action labels, priority/status context, last activity, and shared Followed up / Snooze / Log no answer / Add note actions.
- Followed up flow captures result, optional note, and next follow-up timing using existing `Lead.nextFollowUpDate` and `CommunicationActivity`.
- Snooze flow updates `Lead.nextFollowUpDate` and logs an internal activity note.
- No answer logging creates an outbound call activity and moves the next follow-up to tomorrow.
- Lead Detail now has a compact Follow-Up panel near the top with current follow-up state, last activity, and queue actions.
- Dashboard lead cards now expose lightweight follow-up labels and compact Followed up / Snooze actions without adding a new table.

Still needs QA:

- Production click-through for Followed up, Snooze, No answer, Add note, Clear follow-up, and Set follow-up date.
- Confirm activity entries appear newest-first in the Communication Center after each queue action.
- Confirm Compact and Comfort density both keep dashboard cards from getting bulky.

Future work:

- A dedicated follow-up task table may become useful later if agents need multiple open follow-ups per lead, ownership, reminders, or reporting. It is intentionally not added in this pass.

## Property Decision Tracker - 2026-05-18

Added:

- Centralized default property decision statuses in `lib/property-decision-statuses.ts` so labels, tone, order, grouping, and normalization are not scattered across components.
- Added renter decision statuses for Interested, Liked, Maybe, Rejected, Applying, Backup, and Needs second look while preserving legacy scheduled/toured/approved/closed records.
- Added a compact Lead Detail Decision Tracker that groups attached properties by decision status and highlights a deterministic best-fit signal.
- Added a property decision action on interested property cards and property reports. Updates persist through the existing `PropertyInterest.status` string field and log internal activity entries.
- Property Detail now groups attached renters by decision status so an agent can see who is applying, liked, maybe, interested, rejected, backup, or needs a second look for that property.
- Added documentation in `docs/property-decision-statuses.md` for the future user-customizable status settings model.

Still needs QA:

- Production click-through for each decision status: Interested, Liked, Maybe, Rejected, Applying, Backup, and Needs second look.
- Confirm optional reason/note saves to the property record and appears in the Communication activity timeline newest-first.
- Confirm Dashboard and Today remain compact when decision signals appear.

Future work:

- Add a real user settings screen and database-backed `PropertyDecisionStatusSetting` model only when agents need custom labels/statuses by workspace. No schema change was needed for this pass.

### 1. Production database migration path is still fragile

- Severity: Critical
- Area: Vercel / Neon / Prisma
- QA evidence: Production previously showed a server-side application error after schema changes.
- Current behavior: The app can fail in production if Prisma schema changes are deployed before the Neon production database is migrated.
- Expected behavior: Schema changes should have a reliable migration path before deployment or an explicit post-deploy database step.
- Recommended fix: Reconnect or repair the Neon/Vercel credential path so production env values can be pulled safely, then run the official Prisma migration/db push path. Remove any temporary runtime schema guard once the migration path is reliable.

### 2. Density toggle difference is too subtle

- Severity: Medium
- Area: App shell / global UX
- QA evidence: User reported that Compact vs Comfort mostly looks like a screen shake, not a meaningful density change.
- Current behavior: Compact and Comfort exist, but the practical spacing difference is not obvious enough.
- Expected behavior: Compact should materially reduce vertical spacing, card padding, control size, and secondary text presence.
- Recommended fix: Define clear density rules for cards, filters, lists, forms, sidebars, and section spacing. Comfort can remain roomy; Compact should be visibly tighter.
- 2026-05-13 update: Fixed in this pass by expanding Compact density rules across shared panels, subpanels, dashboard cards, filters, controls, and form spacing. Needs production visual QA.

### 3. Dashboard filters still consume too much space when open

- Severity: Medium
- Area: Dashboard
- QA evidence: User annotated CRM Filters as still having dead space.
- Current behavior: Filters are collapsible, but the expanded state remains visually heavy.
- Expected behavior: Filters should remain easy to scan without taking over the first viewport.
- Recommended fix: Convert filters into a tighter single-row/advanced drawer pattern, or keep common filters visible and move date/source/status details behind "More filters."
- 2026-05-13 update: Fixed in this pass. Search, follow-up, and priority remain in the compact primary row; status, source, and date filters moved behind "More filters." Needs production visual QA.

### 4. New Lead page still needs density review

- Severity: Medium
- Area: New Lead
- QA evidence: User annotated New Lead page as having too much row spacing/dead space.
- Current behavior: Form is usable, but it still feels long for fast intake.
- Expected behavior: Basic lead intake should fit more efficiently, with optional sections collapsed by default and tighter row gaps.
- Recommended fix: Tighten field grid spacing, keep optional showing and preferences collapsed by default, and keep required fields visually prioritized.
- 2026-05-13 update: Improved in this pass with tighter form gaps, smaller optional section padding, shorter notes field, and collapsed optional sections. Needs browser save-flow QA.

### 5. Optional first showing setup needs regression testing

- Severity: Medium
- Area: New Lead / Scheduling
- QA evidence: User requested property selection inside optional first showing setup and collapse behavior like Preferences & Pre-screening.
- Current behavior: Code includes inventory property selection and optional showing controls, but this flow should be manually verified after recent layout changes.
- Expected behavior: User can create a new lead, optionally select a showing property, save date/time/notes, and collapse the section without losing data.
- Recommended fix: Run manual QA. If any friction remains, make first showing setup collapsed by default and ensure property selection is obvious.
- 2026-05-13 update: Code verified in this pass. The optional first showing section is collapsed by default and includes inventory property selection, date/time, and notes. Still needs production form-submission QA.

### 6. Lead detail sections may still feel bulky

- Severity: Medium
- Area: Lead Detail
- QA evidence: User repeatedly noted Preferences & Pre-screening, Communication Center, and lead record sections can make the page too long.
- Current behavior: Some sections are collapsible/compact, but lead detail still requires significant scrolling.
- Expected behavior: Lead detail should expose summary first, then expand into forms only when needed.
- Recommended fix: Default-collapse heavy sections after they contain saved data, keep latest activity visible, and add stronger section-level summaries.
- 2026-05-13 update: Improved in this pass with tighter Lead Detail section spacing and compacted showing/property panels. Still open for deeper section-summary design.

### 7. Communication Center layout needs another UX pass

- Severity: Low / Medium
- Area: Lead Detail / Communication
- QA evidence: User annotated "Templates and activity log" as needing a shuffle-up.
- Current behavior: Templates, contact actions, quick logs, and activity are functional, but the section can still feel like a large form.
- Expected behavior: Communication should feel like a fast action center: choose template, contact/log quickly, see last activity.
- Recommended fix: Consider tabs or a two-column action/timeline layout. Keep activity latest-first and show only recent entries by default.
- 2026-05-13 update: Improved in this pass. Outcome notes are now collapsed, action/log buttons are shorter, and recent activity remains latest-first with latest entries shown by default. Still open for a future tabbed action-center redesign if needed.

### 8. Showing lifecycle quick actions need deployed QA validation

- Severity: Medium
- Area: Today / Routes
- QA evidence: User requested lifecycle buttons be combined under quick options to reduce space.
- Current behavior: Quick actions were implemented, but production should be checked after Vercel deploy.
- Expected behavior: Today and Routes should show one compact "Quick actions" control; expanding it reveals Confirm, Complete/Mark completed, No-show, Cancel, and Reschedule without clipping or layout jump.
- Recommended fix: Verify on desktop and mobile. If inline expansion creates too much height, replace with a popover/drawer.
- 2026-05-13 update: Fixed in this pass by replacing inline expansion with a fixed quick-actions dialog. Needs production click-through QA for toasts/activity entries.

### 9. Dashboard lead-card action row needs deployed QA validation

- Severity: Low / Medium
- Area: Dashboard
- QA evidence: User requested removing the redundant Expand button and aligning initials/name consistently.
- Current behavior: The separate Expand pill was removed and the card header was tightened, but it needs visual QA on production.
- Expected behavior: Lead initials and name align consistently across cards; clicking "Lead details" expands; action buttons do not wrap awkwardly.
- Recommended fix: Verify at desktop widths, tablet widths, and mobile widths.

### 10. Properties sidebar sub-actions need deployed QA validation

- Severity: Low
- Area: Sidebar / Properties
- QA evidence: User requested Properties sidebar should have two sub-buttons: Properties and Add a property.
- Current behavior: Sidebar sub-actions were added.
- Expected behavior: "Properties" opens inventory; "Add a property" jumps to the add listing form without dead navigation or stuck loading.
- Recommended fix: Verify active states and hash navigation after deploy.

### 11. Route Day Run Mode is deferred

- Severity: Medium future workflow need
- Area: Routes
- QA evidence: Route-day execution needs a cleaner active-stop workflow once planning is stable.
- Current behavior: Routes has property-first planning, quick actions, notes, reorder, and Maps links, but no dedicated run mode.
- Expected behavior: A future Run Mode should show the next active stop, hide finished stops by default, require outcome/reason on completion/no-show/cancel, and allow reopening finished stops.
- Recommended fix: Build this next after stabilization, without changing to a first-class Showing model yet unless explicitly scheduled.
- 2026-05-18 update: Fixed. Light Route Day Run Mode was added using existing lead-based showing fields, with active-only stops, finished toggle, required completion outcome, required no-show/cancel reasons, reopen, activity logging, and persistence.

## Recently Fixed Items To Regression-Test

These were reported by QA and have been addressed in code, but should remain on the checklist until confirmed in production.

- Add Property Listing save failures should now show success, validation, duplicate warning, or server error.
- Manual address entry should no longer require clicking "Use this address" before save.
- Duplicate property listings should show a warning and allow intentional create-anyway behavior.
- Property Inventory now has property detail and edit flows.
- Property detail should show related customer interests and scheduled showings.
- Routes are now property-first and should group multiple customers at the same property/day.
- Contact actions should consistently use `tel:`, `sms:`, and correctly encoded `mailto:`.
- Outlook email templates should not show plus signs in subject/body.
- Closed leads should not rise to the top of the dashboard.
- Persistent desktop sidebar should appear as a true left panel, while mobile keeps the top navigation.

## Architecture Risks Masquerading As Bugs

### 1. Showing data is still mostly lead-based

- Severity: High future risk
- Area: Scheduling / Routes / Property Detail
- Why it matters: The product is moving toward property-centric scheduling, where one property can have multiple customer showings on the same day.
- Current limitation: Without a first-class Showing or TourStop model, multi-showing history, reschedules, outcomes, and property-level schedules can become hard to reason about.
- Recommended future fix: Add a dedicated Showing/TourStop model with `leadId`, `propertyListingId` or property reference, scheduled time, lifecycle status, outcome, route order, notes, and cancellation/reschedule history.

### 2. Lead Capture is scaffolded but not production workflow-ready

- Severity: Medium future risk
- Area: Lead Capture / Inbound Email
- Why it matters: The page and API foundation exist, but no real inbound provider is connected.
- Current limitation: It should not be sold or presented as automatic capture until Postmark/SendGrid/Mailgun routing is configured and QA-tested.
- Recommended future fix: Keep it hidden or positioned as beta until the provider webhook, auth secret, dedupe behavior, and low-confidence review queue are proven.

## Workflow Settings Foundation - 2026-05-19

- Added a persisted Workflow Settings foundation with decision-status customization, follow-up defaults, app preferences, and beta feature visibility.
- Property decision statuses can now be renamed, reordered, hidden, reset to defaults, and extended with custom statuses while keeping stable saved status values.
- Decision Tracker, property decision dropdowns, and Property Detail renter grouping now read saved workflow settings when available and fall back to defaults if settings are missing or invalid.
- Follow-up dialogs can use the saved default follow-up timing.
- Needs QA: rename "Maybe" to "Still thinking," hide "Backup," add "Tour again," save, confirm lead/property pages use the updated labels/order, then reset defaults.
- Future work: deeper account settings, team-level settings, default landing redirect behavior, and first-class Showing model settings after the data model is upgraded.
