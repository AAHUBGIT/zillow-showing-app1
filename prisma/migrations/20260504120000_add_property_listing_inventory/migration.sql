CREATE TABLE "PropertyListing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "neighborhood" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "beds" TEXT NOT NULL,
    "baths" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "listingUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT NOT NULL
);

CREATE INDEX "PropertyListing_userId_updatedAt_idx" ON "PropertyListing"("userId", "updatedAt");
CREATE INDEX "PropertyListing_userId_status_idx" ON "PropertyListing"("userId", "status");
CREATE INDEX "PropertyListing_userId_neighborhood_idx" ON "PropertyListing"("userId", "neighborhood");
