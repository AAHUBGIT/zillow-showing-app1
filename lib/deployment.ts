const databaseUrl = process.env.DATABASE_URL ?? "";
const previewMode = (process.env.APP_PREVIEW_MODE ?? "").toLowerCase();

export function isPreviewReadonlyMode() {
  if (previewMode === "readonly") {
    return true;
  }

  if (previewMode === "off") {
    return false;
  }

  return process.env.VERCEL === "1" && (!databaseUrl || databaseUrl.startsWith("file:"));
}

export function canUseDatabase() {
  return Boolean(databaseUrl) && !isPreviewReadonlyMode();
}
