# Property Decision Statuses

Showings CRM now uses a centralized decision-status layer for renter property decisions.

## Current Defaults

- `interested` - Interested
- `liked` - Liked
- `maybe` - Maybe
- `rejected` - Rejected
- `applying` - Applying
- `backup` - Backup
- `needs_second_look` - Needs second look

These defaults live in `lib/property-decision-statuses.ts`. UI components should read labels, tones, ordering, and grouping from that utility instead of hardcoding status arrays locally.

## Legacy Workflow Statuses

The app still recognizes older workflow statuses:

- `scheduled`
- `toured`
- `approved`
- `closed`

They remain supported so older property interest records continue to render correctly.

## Future Customization Plan

Decision statuses are currently code defaults only. A future settings build can move them into a per-user configuration model without rewriting the UI.

Possible future model:

```prisma
model PropertyDecisionStatusSetting {
  id        String @id
  userId    String
  value     String
  label     String
  tone      String
  sortOrder Int
  isActive  Boolean @default(true)
  createdAt String
  updatedAt String

  @@index([userId, sortOrder])
}
```

The utility layer should then merge user-defined active statuses with defaults and preserve safe fallback behavior for older records.
