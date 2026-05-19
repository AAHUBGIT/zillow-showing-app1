CREATE TABLE "WorkflowSettings" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "decisionStatusesJson" TEXT NOT NULL DEFAULT '',
  "defaultFollowUpOption" TEXT NOT NULL DEFAULT 'tomorrow',
  "defaultDensity" TEXT NOT NULL DEFAULT 'compact',
  "defaultLandingPage" TEXT NOT NULL DEFAULT 'dashboard',
  "hideLeadCaptureBeta" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TEXT NOT NULL,
  "updatedAt" TEXT NOT NULL
);

CREATE UNIQUE INDEX "WorkflowSettings_userId_key" ON "WorkflowSettings"("userId");
