export type AppRuntimeMode = "local" | "preview" | "production";
export type AppDatabaseProvider = "sqlite" | "postgres";

const runtimeMode = (process.env.APP_RUNTIME_MODE ?? "").toLowerCase();

export function getAppRuntimeMode(): AppRuntimeMode {
  if (runtimeMode === "local" || runtimeMode === "preview" || runtimeMode === "production") {
    return runtimeMode;
  }

  return process.env.VERCEL === "1" ? "production" : "local";
}

export function getActiveDatabaseProvider(): AppDatabaseProvider {
  return getAppRuntimeMode() === "production" ? "postgres" : "sqlite";
}

export function getActiveDatabaseUrl() {
  if (getActiveDatabaseProvider() === "postgres") {
    return process.env.POSTGRES_DATABASE_URL ?? process.env.DATABASE_URL ?? "";
  }

  return process.env.SQLITE_DATABASE_URL ?? process.env.DATABASE_URL ?? "";
}

export function isPreviewReadonlyMode() {
  return getAppRuntimeMode() === "preview";
}

export function shouldUseDemoData() {
  return getAppRuntimeMode() === "preview";
}

export function canUseDatabase() {
  return Boolean(getActiveDatabaseUrl()) && !isPreviewReadonlyMode();
}
