// Dumps the full current app state as JSON. Run this against the local
// scratch DB from reconstruct-local-db.sh (never against production --
// this session can't reach it anyway). Useful when the user wants a full
// data export (e.g. "give me all the app data").
//
// Usage (from repo root, after reconstruct-local-db.sh and `export DATABASE_URL=...`):
//   npx tsx .claude/skills/career-log/scripts/export-state.ts [output-path]
import "dotenv/config";
import { PrismaClient } from "../../../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { writeFileSync } from "fs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const outPath = process.argv[2] || "/tmp/career-tracker-export.json";

  const [contacts, opportunities, threads, actionItems, scoringModels] = await Promise.all([
    prisma.contact.findMany({ orderBy: { name: "asc" } }),
    prisma.opportunity.findMany({ orderBy: { company: "asc" } }),
    prisma.thread.findMany({ include: { touches: { orderBy: { date: "asc" } } } }),
    prisma.actionItem.findMany({ orderBy: { dueDate: "asc" } }),
    prisma.scoringModel.findMany(),
  ]);

  const data = { exportedAt: new Date().toISOString(), contacts, opportunities, threads, actionItems, scoringModels };
  writeFileSync(outPath, JSON.stringify(data, null, 2));
  console.log(
    `Exported to ${outPath}: ${contacts.length} contacts, ${opportunities.length} opportunities, ` +
      `${threads.length} threads (${threads.reduce((n, t) => n + t.touches.length, 0)} touches), ` +
      `${actionItems.length} action items, ${scoringModels.length} scoring models`
  );
}

main().finally(() => prisma.$disconnect());
