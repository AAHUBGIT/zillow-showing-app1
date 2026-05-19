ALTER TABLE "PropertyListing" ADD COLUMN "listingType" TEXT NOT NULL DEFAULT 'rental';

CREATE INDEX "PropertyListing_userId_listingType_idx" ON "PropertyListing"("userId", "listingType");
