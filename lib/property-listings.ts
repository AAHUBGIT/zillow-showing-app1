import { getSessionUser } from "./auth";
import { canUseDatabase, shouldUseDemoData } from "./deployment";
import { getPrismaClient } from "./prisma";
import type { PropertyListing } from "./types";

export async function getPropertyListings(): Promise<PropertyListing[]> {
  if (shouldUseDemoData() || !canUseDatabase()) {
    return [];
  }

  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return [];
  }

  return getPropertyListingsForUser(sessionUser.id);
}

export async function getPropertyListingsForUser(userId: string): Promise<PropertyListing[]> {
  const prisma = getPrismaClient();

  try {
    return await prisma.$queryRaw<PropertyListing[]>`
      SELECT
        "id",
        "userId",
        "title",
        "address",
        "neighborhood",
        "price",
        "listingType",
        "beds",
        "baths",
        "source",
        "listingUrl",
        "status",
        "notes",
        "createdAt",
        "updatedAt"
      FROM "PropertyListing"
      WHERE "userId" = ${userId}
      ORDER BY "updatedAt" DESC, "createdAt" DESC
    `;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getPropertyListingByIdForUser(userId: string, id: string) {
  const prisma = getPrismaClient();

  try {
    const rows = await prisma.$queryRaw<PropertyListing[]>`
      SELECT
        "id",
        "userId",
        "title",
        "address",
        "neighborhood",
        "price",
        "listingType",
        "beds",
        "baths",
        "source",
        "listingUrl",
        "status",
        "notes",
        "createdAt",
        "updatedAt"
      FROM "PropertyListing"
      WHERE "id" = ${id} AND "userId" = ${userId}
      LIMIT 1
    `;

    return rows[0] || null;
  } catch (error) {
    console.error(error);
    return null;
  }
}
