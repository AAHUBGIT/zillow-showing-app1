const databaseUrl = process.env.DATABASE_URL ?? "";

export function isPreviewReadonlyMode() {
  return process.env.VERCEL === "1" && (!databaseUrl || databaseUrl.startsWith("file:"));
}

export function canUseDatabase() {
  return Boolean(databaseUrl) && !isPreviewReadonlyMode();
}
