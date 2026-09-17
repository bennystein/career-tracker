import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const V1_SCORING_MODEL = {
  version: 1,
  isCurrent: true,
  criteria: [
    { name: "Scope / authority", weight: 20, scale: 5 },
    { name: "Equity / comp upside", weight: 15, scale: 5 },
    { name: "Company trajectory / capital position", weight: 20, scale: 5 },
    { name: "Leadership / culture", weight: 20, scale: 5 },
    { name: "Narrative fit", weight: 15, scale: 5 },
    { name: "Logistics", weight: 10, scale: 5 },
  ],
  redFlags: [
    { name: "Undefined mandate", overrideBehavior: "force_pass" },
    { name: "Toxic leadership", overrideBehavior: "force_pass" },
    { name: "No comp structure", overrideBehavior: "force_pass" },
    { name: "No-thesis turnaround", overrideBehavior: "force_pass" },
  ],
};

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function main() {
  await prisma.scoringModel.upsert({
    where: { version: V1_SCORING_MODEL.version },
    update: V1_SCORING_MODEL,
    create: V1_SCORING_MODEL,
  });

  const recruiter = await prisma.contact.create({
    data: {
      name: "Dana Whitfield",
      firm: "Vantage Search Partners",
      type: "RECRUITER",
      warmthTier: "WARM",
      cadenceTier: "TWO_WEEKS",
      lastTouchDate: daysAgo(20),
      notes: "Handles VP/C-level ops roles, mostly Series B-D.",
    },
  });

  const networkContact = await prisma.contact.create({
    data: {
      name: "Priya Raman",
      firm: "ex-colleague, now at Northwind",
      type: "NETWORK",
      warmthTier: "HOT",
      cadenceTier: "FOUR_WEEKS",
      lastTouchDate: daysAgo(5),
      notes: "Offered to make a warm intro to Northwind's COO.",
    },
  });

  const companyContact = await prisma.contact.create({
    data: {
      name: "Marcus Lee",
      firm: "Brightline Robotics",
      type: "COMPANY_SIDE",
      warmthTier: "WARM",
      cadenceTier: "THREE_DAYS",
      lastTouchDate: daysAgo(10),
      notes: "Hiring manager, VP Ops role. Owes a follow-up on comp band.",
    },
  });

  const opp1 = await prisma.opportunity.create({
    data: {
      company: "Brightline Robotics",
      role: "VP Operations",
      stage: "INTERVIEWING",
      status: "ACTIVE",
      sourceContactId: companyContact.id,
      nextAction: "Send follow-up on comp band",
      nextActionOwner: "THEM",
      lastTouchDate: daysAgo(10),
      notes: "Strong scope, Series C, capital efficient. Panel done, waiting on comp.",
      scoringModelVersion: 1,
      criterionScores: [
        { name: "Scope / authority", value: 4 },
        { name: "Equity / comp upside", value: 3 },
        { name: "Company trajectory / capital position", value: 4 },
        { name: "Leadership / culture", value: 4 },
        { name: "Narrative fit", value: 4 },
        { name: "Logistics", value: 5 },
      ],
      redFlagsTriggered: [],
      computedScore: 3.85,
      recommendation: "PURSUE",
    },
  });

  const opp2 = await prisma.opportunity.create({
    data: {
      company: "Northwind Systems",
      role: "COO",
      stage: "LEAD",
      status: "ACTIVE",
      sourceContactId: networkContact.id,
      nextAction: "Ask Priya for the warm intro",
      nextActionOwner: "BEN",
      lastTouchDate: daysAgo(5),
      notes: "Not yet scoped — pending intro.",
      recommendation: "UNSCORED",
    },
  });

  const opp3 = await prisma.opportunity.create({
    data: {
      company: "Halden Turnaround Co.",
      role: "COO",
      stage: "SCREEN",
      status: "PASSED",
      sourceContactId: recruiter.id,
      nextAction: null,
      lastTouchDate: daysAgo(20),
      notes: "No articulated turnaround thesis from the board.",
      scoringModelVersion: 1,
      criterionScores: [
        { name: "Scope / authority", value: 4 },
        { name: "Equity / comp upside", value: 3 },
        { name: "Company trajectory / capital position", value: 2 },
        { name: "Leadership / culture", value: 2 },
        { name: "Narrative fit", value: 2 },
        { name: "Logistics", value: 4 },
      ],
      redFlagsTriggered: ["No-thesis turnaround"],
      computedScore: 2.75,
      recommendation: "PASS",
    },
  });

  const thread1 = await prisma.thread.create({
    data: { contactId: companyContact.id, opportunityId: opp1.id },
  });
  await prisma.touch.createMany({
    data: [
      {
        threadId: thread1.id,
        date: daysAgo(17),
        summary: "Intro call. Scoped role, discussed reporting line to CEO.",
        direction: "FYI",
      },
      {
        threadId: thread1.id,
        date: daysAgo(10),
        summary: "Panel interview completed. Marcus said comp band would follow by end of week.",
        direction: "THEY_OWE",
      },
    ],
  });

  const thread2 = await prisma.thread.create({
    data: { contactId: networkContact.id, opportunityId: opp2.id },
  });
  await prisma.touch.create({
    data: {
      threadId: thread2.id,
      date: daysAgo(5),
      summary: "Priya offered to intro to Northwind's COO once she's back from leave (next week).",
      direction: "BEN_OWES",
    },
  });

  const thread3 = await prisma.thread.create({
    data: { contactId: recruiter.id, opportunityId: opp3.id },
  });
  await prisma.touch.create({
    data: {
      threadId: thread3.id,
      date: daysAgo(20),
      summary: "Debrief on Halden screen — passing, no real turnaround thesis from the board.",
      direction: "FYI",
    },
  });

  await prisma.actionItem.create({
    data: {
      kind: "MANUAL",
      title: "Follow up with Marcus on comp band if nothing by Friday",
      dueDate: daysAgo(-2),
      status: "OPEN",
      opportunityId: opp1.id,
      contactId: companyContact.id,
    },
  });

  console.log("Seeded:");
  console.log(`  ScoringModel v${V1_SCORING_MODEL.version}`);
  console.log(`  Contacts: ${recruiter.name}, ${networkContact.name}, ${companyContact.name}`);
  console.log(`  Opportunities: ${opp1.company} / ${opp2.company} / ${opp3.company}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
