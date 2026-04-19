ALTER TABLE "PropertyInterest" ADD COLUMN "clientFeedback" TEXT NOT NULL DEFAULT '';
ALTER TABLE "PropertyInterest" ADD COLUMN "showingDate" TEXT NOT NULL DEFAULT '';
ALTER TABLE "PropertyInterest" ADD COLUMN "showingTime" TEXT NOT NULL DEFAULT '';

UPDATE "PropertyInterest"
SET "status" = 'approved'
WHERE "status" = 'closed';
