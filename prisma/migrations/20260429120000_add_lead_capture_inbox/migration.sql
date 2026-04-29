CREATE TABLE "LeadInbox" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "userEmail" TEXT,
    "inboxSlug" TEXT NOT NULL,
    "inboxEmail" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL
);

CREATE UNIQUE INDEX "LeadInbox_inboxSlug_key" ON "LeadInbox"("inboxSlug");
CREATE UNIQUE INDEX "LeadInbox_inboxEmail_key" ON "LeadInbox"("inboxEmail");
CREATE INDEX "LeadInbox_userId_idx" ON "LeadInbox"("userId");

CREATE TABLE "InboundEmail" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "inboxSlug" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "fromEmail" TEXT NOT NULL,
    "fromName" TEXT,
    "subject" TEXT,
    "rawBody" TEXT NOT NULL,
    "parseStatus" TEXT NOT NULL,
    "parsedLeadId" TEXT,
    "errorMessage" TEXT,
    "createdAt" TEXT NOT NULL,
    CONSTRAINT "InboundEmail_parsedLeadId_fkey" FOREIGN KEY ("parsedLeadId") REFERENCES "Lead" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "InboundEmail_userId_createdAt_idx" ON "InboundEmail"("userId", "createdAt");
CREATE INDEX "InboundEmail_inboxSlug_createdAt_idx" ON "InboundEmail"("inboxSlug", "createdAt");
CREATE INDEX "InboundEmail_parseStatus_createdAt_idx" ON "InboundEmail"("parseStatus", "createdAt");
