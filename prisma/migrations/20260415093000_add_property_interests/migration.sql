CREATE TABLE "PropertyInterest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leadId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "listingTitle" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "listingUrl" TEXT NOT NULL,
    "rent" TEXT NOT NULL,
    "beds" TEXT NOT NULL,
    "baths" TEXT NOT NULL,
    "neighborhood" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "pros" TEXT NOT NULL,
    "cons" TEXT NOT NULL,
    "agentNotes" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT NOT NULL,
    CONSTRAINT "PropertyInterest_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "PropertyInterest_leadId_idx" ON "PropertyInterest"("leadId");
