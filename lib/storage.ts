import { promises as fs } from "fs";
import path from "path";
import { Lead } from "./types";

const leadsFilePath = path.join(process.cwd(), "data", "leads.json");

async function ensureLeadsFile() {
  const directory = path.dirname(leadsFilePath);
  await fs.mkdir(directory, { recursive: true });

  try {
    await fs.access(leadsFilePath);
  } catch {
    await fs.writeFile(leadsFilePath, JSON.stringify([], null, 2), "utf8");
  }
}

export async function getLeads() {
  await ensureLeadsFile();
  const file = await fs.readFile(leadsFilePath, "utf8");
  const leads = JSON.parse(file) as Lead[];
  return leads.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export async function getLeadById(id: string) {
  const leads = await getLeads();
  return leads.find((lead) => lead.id === id);
}

export async function saveLeads(leads: Lead[]) {
  await ensureLeadsFile();
  await fs.writeFile(leadsFilePath, JSON.stringify(leads, null, 2), "utf8");
}

export function buildGoogleMapsDirectionsLink(addresses: string[]) {
  if (addresses.length === 0) {
    return "https://www.google.com/maps";
  }

  if (addresses.length === 1) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addresses[0])}`;
  }

  const origin = encodeURIComponent(addresses[0]);
  const destination = encodeURIComponent(addresses[addresses.length - 1]);
  const waypoints = addresses
    .slice(1, -1)
    .map((address) => encodeURIComponent(address))
    .join("|");

  const waypointQuery = waypoints ? `&waypoints=${waypoints}` : "";

  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypointQuery}&travelmode=driving`;
}
