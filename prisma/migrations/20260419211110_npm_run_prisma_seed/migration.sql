-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "propertyAddress" TEXT NOT NULL,
    "desiredMoveInDate" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "nextFollowUpDate" TEXT NOT NULL,
    "showingDate" TEXT NOT NULL,
    "showingTime" TEXT NOT NULL,
    "routeStopOrder" INTEGER NOT NULL DEFAULT 0,
    "routeCompleted" BOOLEAN NOT NULL DEFAULT false,
    "routeNote" TEXT NOT NULL DEFAULT '',
    "agentNotes" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT NOT NULL
);
INSERT INTO "new_Lead" ("agentNotes", "createdAt", "desiredMoveInDate", "email", "fullName", "id", "nextFollowUpDate", "notes", "phone", "priority", "propertyAddress", "routeCompleted", "routeNote", "routeStopOrder", "showingDate", "showingTime", "source", "status", "updatedAt", "userId") SELECT "agentNotes", "createdAt", "desiredMoveInDate", "email", "fullName", "id", "nextFollowUpDate", "notes", "phone", "priority", "propertyAddress", "routeCompleted", "routeNote", "routeStopOrder", "showingDate", "showingTime", "source", "status", "updatedAt", "userId" FROM "Lead";
DROP TABLE "Lead";
ALTER TABLE "new_Lead" RENAME TO "Lead";
CREATE TABLE "new_PropertyInterest" (
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
    "clientFeedback" TEXT NOT NULL,
    "pros" TEXT NOT NULL,
    "cons" TEXT NOT NULL,
    "agentNotes" TEXT NOT NULL,
    "showingDate" TEXT NOT NULL,
    "showingTime" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT NOT NULL,
    CONSTRAINT "PropertyInterest_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PropertyInterest" ("address", "agentNotes", "baths", "beds", "clientFeedback", "cons", "createdAt", "id", "leadId", "listingTitle", "listingUrl", "neighborhood", "pros", "rating", "rent", "showingDate", "showingTime", "source", "status", "updatedAt") SELECT "address", "agentNotes", "baths", "beds", "clientFeedback", "cons", "createdAt", "id", "leadId", "listingTitle", "listingUrl", "neighborhood", "pros", "rating", "rent", "showingDate", "showingTime", "source", "status", "updatedAt" FROM "PropertyInterest";
DROP TABLE "PropertyInterest";
ALTER TABLE "new_PropertyInterest" RENAME TO "PropertyInterest";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
