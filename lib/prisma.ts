import { PrismaClient as SqlitePrismaClient } from "@/generated/prisma";
import { PrismaClient as PostgresPrismaClient } from "@/generated/prisma-postgres";
import { getActiveDatabaseProvider } from "./deployment";

type AppPrismaClient = SqlitePrismaClient;

declare global {
  // eslint-disable-next-line no-var
  var prisma: AppPrismaClient | undefined;
}

function createPrismaClient(): AppPrismaClient {
  if (getActiveDatabaseProvider() === "postgres") {
    return new PostgresPrismaClient({
      log: ["error"]
    }) as unknown as AppPrismaClient;
  }

  return new SqlitePrismaClient({
    log: ["error"]
  });
}

export function getPrismaClient() {
  if (!global.prisma) {
    global.prisma = createPrismaClient();
  }

  return global.prisma;
}
