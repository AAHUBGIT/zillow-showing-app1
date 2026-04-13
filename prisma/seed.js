const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function main() {
  const leadsFilePath = path.join(process.cwd(), "data", "leads.json");
  const fileContents = fs.readFileSync(leadsFilePath, "utf8");
  const leads = JSON.parse(fileContents);

  await prisma.lead.deleteMany();

  if (leads.length > 0) {
    await prisma.lead.createMany({
      data: leads.map((lead) => ({
        ...lead,
        userId: lead.userId || "demo-user",
        priority: lead.priority || "medium",
        source: lead.source || "other",
        nextFollowUpDate: lead.nextFollowUpDate || ""
      }))
    });
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
