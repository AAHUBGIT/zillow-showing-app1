const { PrismaClient } = require("../generated/prisma");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

function normalizePropertyStatus(status) {
  if (status === "closed") {
    return "approved";
  }

  return status || "interested";
}

async function main() {
  const leadsFilePath = path.join(process.cwd(), "data", "leads.json");
  const fileContents = fs.readFileSync(leadsFilePath, "utf8");
  const leads = JSON.parse(fileContents);

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

  console.log(`Seeded ${leads.length} leads into SQLite.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
