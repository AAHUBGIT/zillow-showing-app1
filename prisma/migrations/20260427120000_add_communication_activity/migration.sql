CREATE TABLE "CommunicationTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "subject" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT NOT NULL
);

CREATE INDEX "CommunicationTemplate_userId_sortOrder_idx" ON "CommunicationTemplate"("userId", "sortOrder");

CREATE TABLE "CommunicationActivity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leadId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL DEFAULT '',
    "channel" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "subject" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL,
    "outcome" TEXT NOT NULL DEFAULT '',
    "occurredAt" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL,
    CONSTRAINT "CommunicationActivity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "CommunicationActivity_leadId_occurredAt_idx" ON "CommunicationActivity"("leadId", "occurredAt");
CREATE INDEX "CommunicationActivity_userId_occurredAt_idx" ON "CommunicationActivity"("userId", "occurredAt");
