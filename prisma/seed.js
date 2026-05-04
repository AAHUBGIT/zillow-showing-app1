const fs = require("fs");
const path = require("path");

function getSeedTarget() {
  const targetArg = process.argv.find((argument) => argument.startsWith("--target="));

  if (targetArg) {
    return targetArg.split("=")[1];
  }

  return process.env.APP_RUNTIME_MODE === "production" ? "postgres" : "sqlite";
}

function getPrismaClient() {
  const target = getSeedTarget();

  if (target === "postgres") {
    const { PrismaClient } = require("../generated/prisma-postgres");
    return new PrismaClient();
  }

  const { PrismaClient } = require("../generated/prisma");
  return new PrismaClient();
}

const prisma = getPrismaClient();

function normalizePropertyStatus(status) {
  if (status === "closed") {
    return "approved";
  }

  return status || "interested";
}

const demoSchedulePresets = {
  "lead-1": {
    showingOffset: 0,
    showingTime: "10:00",
    followUpOffset: 0,
    status: "scheduled",
    routeStopOrder: 1
  },
  "lead-2": {
    followUpOffset: -1,
    status: "contacted"
  },
  "lead-3": {
    showingOffset: 1,
    showingTime: "11:30",
    followUpOffset: 1,
    status: "scheduled",
    routeStopOrder: 1
  },
  "lead-4": {
    showingOffset: 3,
    showingTime: "13:30",
    followUpOffset: 2,
    status: "scheduled",
    routeStopOrder: 1
  },
  "lead-5": {
    showingOffset: 5,
    showingTime: "09:15",
    status: "scheduled",
    routeStopOrder: 1
  }
};

function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(offset) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return toIsoDate(date);
}

function relativeTimestamp(offset, hour = 14) {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return date.toISOString();
}

function getFallbackShowingOffset(index) {
  return [7, 10, 14, 21][index % 4];
}

function getFallbackFollowUpOffset(index) {
  return [-2, 0, 1, 3, 5][index % 5];
}

function withFreshDemoDates(lead, index) {
  const preset = demoSchedulePresets[lead.id];
  const isClosed = lead.status === "closed" || preset?.status === "closed";
  const hasOriginalShowing = Boolean(lead.showingDate && lead.showingTime);
  const showingOffset =
    preset?.showingOffset ??
    (hasOriginalShowing ? (isClosed ? -3 : getFallbackShowingOffset(index)) : undefined);
  const showingDate = showingOffset === undefined ? "" : addDays(showingOffset);
  const showingTime =
    showingOffset === undefined ? "" : preset?.showingTime || lead.showingTime || "10:00";
  const followUpOffset =
    preset?.followUpOffset ??
    (isClosed ? undefined : lead.nextFollowUpDate ? getFallbackFollowUpOffset(index) : undefined);
  const nextFollowUpDate = followUpOffset === undefined ? "" : addDays(followUpOffset);
  const status =
    preset?.status ||
    (showingDate && showingTime && lead.status !== "closed" ? "scheduled" : lead.status);

  return {
    ...lead,
    desiredMoveInDate: lead.desiredMoveInDate ? addDays(14 + index * 2) : "",
    nextFollowUpDate,
    showingDate,
    showingTime,
    status,
    routeStopOrder: showingDate && showingTime ? preset?.routeStopOrder || 1 : 0,
    routeCompleted: showingOffset !== undefined && showingOffset < 0 ? Boolean(lead.routeCompleted) : false,
    createdAt: relativeTimestamp(-10 - index, 10),
    updatedAt: relativeTimestamp(-index, 15),
    propertyInterests: (lead.propertyInterests || []).map((propertyInterest, propertyIndex) => ({
      ...propertyInterest,
      createdAt: relativeTimestamp(-10 - index - propertyIndex, 11),
      updatedAt: relativeTimestamp(-index, 16)
    }))
  };
}

async function main() {
  const leadsFilePath = path.join(process.cwd(), "data", "leads.json");
  const fileContents = fs.readFileSync(leadsFilePath, "utf8");
  const leads = JSON.parse(fileContents).map(withFreshDemoDates);

  await prisma.propertyInterest.deleteMany();
  await prisma.lead.deleteMany();

  if (leads.length > 0) {
    for (const lead of leads) {
      await prisma.lead.create({
        data: {
          id: lead.id,
          userId: lead.userId || "demo-user",
          fullName: lead.fullName,
          phone: lead.phone,
          email: lead.email,
          propertyAddress: lead.propertyAddress,
          desiredMoveInDate: lead.desiredMoveInDate,
          notes: lead.notes,
          budgetMin: lead.budgetMin || "",
          budgetMax: lead.budgetMax || "",
          bedrooms: lead.bedrooms || "",
          bathrooms: lead.bathrooms || "",
          preferredNeighborhoods: lead.preferredNeighborhoods || "",
          moveInUrgency: lead.moveInUrgency || "",
          mustHaves: lead.mustHaves || "",
          dealBreakers: lead.dealBreakers || "",
          pets: lead.pets || "",
          incomeQualified: Boolean(lead.incomeQualified),
          creditConcern: Boolean(lead.creditConcern),
          hasGuarantor: Boolean(lead.hasGuarantor),
          applicationReady: Boolean(lead.applicationReady),
          preScreeningNotes: lead.preScreeningNotes || "",
          status: lead.status,
          priority: lead.priority || "medium",
          source: lead.source || "other",
          nextFollowUpDate: lead.nextFollowUpDate || "",
          showingDate: lead.showingDate || "",
          showingTime: lead.showingTime || "",
          routeStopOrder: Number(lead.routeStopOrder || 0),
          routeCompleted: Boolean(lead.routeCompleted || false),
          routeNote: lead.routeNote || "",
          agentNotes: lead.agentNotes || "",
          createdAt: lead.createdAt,
          updatedAt: lead.updatedAt,
          propertyInterests: {
            create: (lead.propertyInterests || []).map((propertyInterest) => {
              const normalizedStatus = normalizePropertyStatus(propertyInterest.status);
              const showingDate =
                propertyInterest.showingDate ||
                (lead.showingDate &&
                lead.showingTime &&
                propertyInterest.address === lead.propertyAddress &&
                normalizedStatus === "interested"
                  ? lead.showingDate
                  : "");
              const showingTime =
                propertyInterest.showingTime ||
                (lead.showingDate &&
                lead.showingTime &&
                propertyInterest.address === lead.propertyAddress &&
                normalizedStatus === "interested"
                  ? lead.showingTime
                  : "");

              return {
                id: propertyInterest.id,
                address: propertyInterest.address,
                listingTitle: propertyInterest.listingTitle,
                source: propertyInterest.source || "other",
                listingUrl: propertyInterest.listingUrl || "",
                rent: propertyInterest.rent || "",
                beds: propertyInterest.beds || "",
                baths: propertyInterest.baths || "",
                neighborhood: propertyInterest.neighborhood || "",
                status:
                  normalizedStatus === "interested" && showingDate && showingTime
                    ? "scheduled"
                    : normalizedStatus,
                rating: propertyInterest.rating || 3,
                clientFeedback: propertyInterest.clientFeedback || "",
                pros: propertyInterest.pros || "",
                cons: propertyInterest.cons || "",
                agentNotes: propertyInterest.agentNotes || "",
                showingDate,
                showingTime,
                createdAt: propertyInterest.createdAt,
                updatedAt: propertyInterest.updatedAt
              };
            })
          }
        }
      });
    }
  }

  console.log(`Seeded ${leads.length} leads into ${getSeedTarget()} database.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
