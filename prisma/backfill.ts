/**
 * One-time backfill from Network_Map.md (rebuilt Sep 17, 2026), reviewed
 * with Ben in chat before running. IDs are explicit/readable rather than
 * cuid()-generated so the resulting data is easy to audit and re-derive as
 * SQL for a manual paste into Supabase's SQL Editor, if that's how it ends
 * up getting applied to production.
 *
 * Excluded on purpose: inbound spam/fake pitches, the Tegus paid-research
 * inquiry, the Docusign/separation-agreement item (that's the separation
 * file, not this one), and speculative "awaiting intro" targets with no
 * named contact yet (Island, ClickHouse, Glean, Saronic, Visa, PANW).
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import type {
  ActionOwner,
  CadenceTier,
  ContactType,
  OpportunityStatus,
  Stage,
  TouchDirection,
  WarmthTier,
} from "../src/generated/prisma/enums";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const d = (s: string) => new Date(s);

type ContactSeed = {
  id: string;
  name: string;
  firm?: string;
  type: ContactType;
  warmthTier: WarmthTier;
  cadenceTier: CadenceTier;
  lastTouchDate?: Date;
  notes?: string;
};

type OpportunitySeed = {
  id: string;
  company: string;
  role: string;
  stage: Stage;
  status: OpportunityStatus;
  sourceContactId?: string;
  nextAction?: string;
  nextActionOwner?: ActionOwner;
  lastTouchDate?: Date;
  notes?: string;
};

type ThreadSeed = {
  id: string;
  contactId: string;
  opportunityId?: string;
  touches: { date: Date; summary: string; direction: TouchDirection }[];
};

type ActionItemSeed = {
  title: string;
  dueDate: Date;
  opportunityId?: string;
  contactId?: string;
};

const contacts: ContactSeed[] = [
  // --- CompanyCam ---
  { id: "c-blake-lindgren", name: "Blake Lindgren", firm: "Insight Partners", type: "RECRUITER", warmthTier: "HOT", cadenceTier: "THREE_DAYS", lastTouchDate: d("2026-09-16"), notes: "CompanyCam. Waiting on him to connect with Luke Hansen." },
  // --- Darktrace ---
  { id: "c-jennifer-martin", name: "Jennifer Martin", firm: "Spencer Stuart", type: "RECRUITER", warmthTier: "HOT", cadenceTier: "THREE_DAYS", lastTouchDate: d("2026-09-16"), notes: "Darktrace. Organized the Mon 9/21 CEO call, cc'ing Katina Kushner. Internal codename \"Project Wallace.\"" },
  { id: "c-liam-hurley", name: "Liam Hurley", firm: "Spencer Stuart", type: "RECRUITER", warmthTier: "WARM", cadenceTier: "TWO_WEEKS", lastTouchDate: d("2026-09-16"), notes: "Darktrace, co-recruiter with Jennifer Martin." },
  { id: "c-david-smith", name: "David Smith", firm: "Darktrace", type: "COMPANY_SIDE", warmthTier: "HOT", cadenceTier: "THREE_DAYS", lastTouchDate: d("2026-09-16"), notes: "CPO. Hold on calendar Mon 9/21, 10-11am PT." },
  { id: "c-ed-jennings", name: "Ed Jennings", firm: "Darktrace", type: "COMPANY_SIDE", warmthTier: "HOT", cadenceTier: "THREE_DAYS", lastTouchDate: d("2026-09-16"), notes: "CEO. Confirmed Teams call Mon 9/21, 11:30am-12:30pm PT." },
  // --- Turn/River Capital ---
  { id: "c-elle-carroll", name: "Elle Carroll", firm: "True Search", type: "RECRUITER", warmthTier: "WARM", cadenceTier: "TWO_WEEKS", lastTouchDate: d("2026-09-16"), notes: "Turn/River Capital." },
  { id: "c-david-pugliese", name: "David Pugliese", firm: "True Search", type: "RECRUITER", warmthTier: "WARM", cadenceTier: "TWO_WEEKS", lastTouchDate: d("2026-09-16"), notes: "Turn/River Capital." },
  { id: "c-sarah-barrett", name: "Sarah Barrett", firm: "True Search", type: "RECRUITER", warmthTier: "WARM", cadenceTier: "TWO_WEEKS", lastTouchDate: d("2026-09-16"), notes: "Confirmed the Saied Amiry Zoom for Turn/River." },
  { id: "c-saied-amiry", name: "Saied Amiry", firm: "Turn/River Capital", type: "COMPANY_SIDE", warmthTier: "WARM", cadenceTier: "TWO_WEEKS", lastTouchDate: d("2026-09-16"), notes: "Zoom confirmed Tue 9/22, 10-11am PT." },
  { id: "c-alvin-ang", name: "Alvin Ang", firm: "Turn/River Capital", type: "COMPANY_SIDE", warmthTier: "WARM", cadenceTier: "TWO_WEEKS", notes: "Earlier call already went well." },
  // --- ZoomInfo ---
  { id: "c-james-roth", name: "James Roth", firm: "ZoomInfo", type: "COMPANY_SIDE", warmthTier: "HOT", cadenceTier: "THREE_DAYS", lastTouchDate: d("2026-09-16"), notes: "CRO. All four Dreamforce meetings held Sep 16." },
  { id: "c-andrew-riesenfeld", name: "Andrew Riesenfeld", firm: "ZoomInfo", type: "COMPANY_SIDE", warmthTier: "HOT", cadenceTier: "THREE_DAYS", lastTouchDate: d("2026-09-16"), notes: "COO GTM. Meeting CEO Henry to decide scope (VP vs SVP)." },
  // --- Anaplan ---
  { id: "c-rob-lee", name: "Rob Lee", firm: "JM Search", type: "RECRUITER", warmthTier: "WARM", cadenceTier: "TWO_WEEKS", notes: "Anaplan GTM COO search." },
  { id: "c-greg-randolph", name: "Greg Randolph", firm: "Anaplan", type: "COMPANY_SIDE", warmthTier: "WARM", cadenceTier: "TWO_WEEKS", lastTouchDate: d("2026-09-16"), notes: "President/CRO. Follow-up note sent Sep 16, 4:38pm PT." },
  // --- Cherry Technologies ---
  { id: "c-brandon-self", name: "Brandon Self", firm: "BreakLine", type: "RECRUITER", warmthTier: "HOT", cadenceTier: "THREE_DAYS", notes: "Sourced Cherry Technologies." },
  { id: "c-felix-steinmeyer", name: "Felix Steinmeyer", firm: "Cherry Technologies", type: "COMPANY_SIDE", warmthTier: "HOT", cadenceTier: "THREE_DAYS", notes: "CEO/Co-founder. Call Thu 9/17, 7:30-7:50am PT." },
  // --- Sublime Security ---
  { id: "c-ian-thiel", name: "Ian Thiel", firm: "Sublime Security", type: "COMPANY_SIDE", warmthTier: "HOT", cadenceTier: "THREE_DAYS", notes: "Co-founder/COO. Call confirmed Tue 9/23, 9:30-10am PT (the Fri 9/18 calendar hold is stale)." },
  // --- Scale AI / Operators Fund ---
  { id: "c-trevor-thompson", name: "Trevor Thompson", type: "NETWORK", warmthTier: "WARM", cadenceTier: "TWO_WEEKS", notes: "Sourced both Scale AI (Max Lintott) and Operators Fund (Alec Williams)." },
  { id: "c-max-lintott", name: "Max Lintott", firm: "Scale AI", type: "COMPANY_SIDE", warmthTier: "HOT", cadenceTier: "THREE_DAYS", notes: "Call confirmed Fri 9/18, 8:30-9:00am PT." },
  { id: "c-alec-williams", name: "Alec Williams", firm: "Operators Fund", type: "COMPANY_SIDE", warmthTier: "WARM", cadenceTier: "TWO_WEEKS", notes: "Call confirmed Mon 9/21, 9:00-9:30am PT, Google Meet." },
  // --- CodeMetal ---
  { id: "c-zayn-knaub", name: "Zayn Knaub", firm: "War Matrix", type: "RECRUITER", warmthTier: "WARM", cadenceTier: "TWO_WEEKS", notes: "CodeMetal GM search." },
  { id: "c-laura-shen", name: "Laura Shen", firm: "War Matrix", type: "RECRUITER", warmthTier: "WARM", cadenceTier: "TWO_WEEKS", notes: "CodeMetal GM search." },
  { id: "c-charlie-harrison", name: "Charlie Harrison", firm: "CodeMetal", type: "COMPANY_SIDE", warmthTier: "HOT", cadenceTier: "THREE_DAYS", notes: "Call rescheduled, now Thu 9/17, 9:00-9:15am PT, Charlie calling Ben." },
  // --- Grid Aero ---
  { id: "c-jon-rezneck", name: "Jon Rezneck", firm: "Geodesic Capital", type: "NETWORK", warmthTier: "WARM", cadenceTier: "TWO_WEEKS", notes: "Sourced Grid Aero. Also has Geodesic shortlist portco intros pending (Island, ClickHouse, Glean, Saronic)." },
  { id: "c-arthur-dubois", name: "Arthur Dubois", firm: "Grid Aero", type: "COMPANY_SIDE", warmthTier: "WARM", cadenceTier: "TWO_WEEKS", notes: "In-person confirmed Mon 9/21, 3-4pm PT, 795 Aladdin Ave, San Leandro." },
  // --- Ironclad ---
  { id: "c-dan-streetman", name: "Dan Streetman", type: "NETWORK", warmthTier: "WARM", cadenceTier: "TWO_WEEKS", notes: "Active sponsor. Made the Ironclad intro." },
  { id: "c-helen-wang", name: "Helen Wang", firm: "Ironclad", type: "COMPANY_SIDE", warmthTier: "WARM", cadenceTier: "TWO_WEEKS", notes: "CFO, not the hiring exec. Coffee confirmed Thu 9/17, 11:00-11:45am PT, Coffeebar Menlo Park. Elise Bergeron holds Chief Marketing & Strategy Officer." },
  // --- UFORCE ---
  { id: "c-david-rothzeid", name: "David Rothzeid", firm: "Shield Capital", type: "NETWORK", warmthTier: "WARM", cadenceTier: "TWO_WEEKS", lastTouchDate: d("2026-09-16"), notes: "Connected Ben directly to Brett (recruiter) at UFORCE, Sep 16 7:44pm PT." },
  { id: "c-brett-uforce", name: "Brett", firm: "UFORCE", type: "RECRUITER", warmthTier: "HOT", cadenceTier: "THREE_DAYS", lastTouchDate: d("2026-09-16"), notes: "Ben replied 8:05pm PT Sep 16, moved David Rothzeid to bcc, asked about needs/availability." },
  { id: "c-oleg-rogynskyy", name: "Oleg Rogynskyy", firm: "UFORCE", type: "NETWORK", warmthTier: "COLD", cadenceTier: "FOUR_WEEKS", lastTouchDate: d("2026-08-17"), notes: "Co-founder, personal connection from People.ai. Direct outreach in August, no reply on file. Reconsider re-pinging now that the Brett recruiter track is live." },
  // --- Syncro ---
  { id: "c-michael-george", name: "Michael George", firm: "Syncro", type: "COMPANY_SIDE", warmthTier: "COLD", cadenceTier: "FOUR_WEEKS", lastTouchDate: d("2026-09-14"), notes: "Exploratory call went deeper than expected Sep 14, then went quiet." },

  // --- Recruiter/search-firm threads without a currently-live opportunity ---
  { id: "c-beau-blanchard", name: "Beau Blanchard", firm: "Spencer Stuart, Seattle", type: "RECRUITER", warmthTier: "COLD", cadenceTier: "FOUR_WEEKS", notes: "No follow-up needed currently." },
  { id: "c-ella-conway", name: "Ella Conway", firm: "Insight Partners", type: "RECRUITER", warmthTier: "WARM", cadenceTier: "TWO_WEEKS", notes: "Separate warm thread from Blake Lindgren/CompanyCam. No fresh movement." },
  { id: "c-brian-warner", name: "Brian Warner", firm: "Heidrick", type: "RECRUITER", warmthTier: "COLD", cadenceTier: "FOUR_WEEKS", notes: "PANW, Visa. No action needed." },
  { id: "c-gowri-rao", name: "Gowri Rao", firm: "Heidrick", type: "RECRUITER", warmthTier: "COLD", cadenceTier: "FOUR_WEEKS", notes: "B Capital portfolio research. No fresh movement." },
  { id: "c-justin-ossola", name: "Justin Ossola", firm: "True Search", type: "RECRUITER", warmthTier: "WARM", cadenceTier: "TWO_WEEKS", notes: "30-day check-in on the books. Unread LinkedIn message as of Sep 16, not yet checked." },
  { id: "c-marty-mcmahon", name: "Marty McMahon", firm: "FlemingMartin", type: "RECRUITER", warmthTier: "WARM", cadenceTier: "TWO_WEEKS", notes: "Holding the nudge until next week per Ben's own call. Blue Angels event Oct 10." },
  { id: "c-dan-grosh", name: "Dan Grosh", firm: "FlemingMartin", type: "RECRUITER", warmthTier: "WARM", cadenceTier: "TWO_WEEKS", notes: "Holding the nudge until next week per Ben's own call. Blue Angels event Oct 10." },
  { id: "c-jason-slattery", name: "Jason Slattery", firm: "Daversa", type: "RECRUITER", warmthTier: "WARM", cadenceTier: "TWO_WEEKS", notes: "Nudged, no reply on file yet." },
  { id: "c-gregg-blatt", name: "Gregg Blatt", firm: "SBI", type: "RECRUITER", warmthTier: "WARM", cadenceTier: "TWO_WEEKS", notes: "Active, no fresh movement found." },
  { id: "c-robin-jones", name: "Robin Jones", firm: "SBI", type: "RECRUITER", warmthTier: "WARM", cadenceTier: "TWO_WEEKS", notes: "Active, no fresh movement found." },
  { id: "c-russ-slaten", name: "Russ Slaten", type: "NETWORK", warmthTier: "COLD", cadenceTier: "FOUR_WEEKS", notes: "Sourced the Emilie Pritchard intro." },
  { id: "c-emilie-pritchard", name: "Emilie Pritchard", firm: "Bespoke Partners", type: "RECRUITER", warmthTier: "WARM", cadenceTier: "TWO_WEEKS", lastTouchDate: d("2026-09-14"), notes: "First call held Sep 14. Debrief not yet given." },
  { id: "c-emily-azevedo", name: "Emily Azevedo", firm: "Mainsail", type: "RECRUITER", warmthTier: "WARM", cadenceTier: "TWO_WEEKS", lastTouchDate: d("2026-09-14"), notes: "Sourced Syncro. Still owes intros to a Francisco Partners contact and an Hg contact." },

  // --- Personal network ---
  { id: "c-lanai-lexi", name: "Lanai (Lexi)", type: "NETWORK", warmthTier: "WARM", cadenceTier: "TWO_WEEKS", notes: "Pure networking per Ben, not an opportunity. Meeting Thu 9/18, 4:00-4:30pm PT." },
  { id: "c-scott-roza", name: "Scott Roza", type: "NETWORK", warmthTier: "WARM", cadenceTier: "TWO_WEEKS", notes: "Vista network. Committed to more search-firm intros." },
  { id: "c-andy-mowat", name: "Andy Mowat", firm: "Whispered", type: "NETWORK", warmthTier: "WARM", cadenceTier: "TWO_WEEKS", lastTouchDate: d("2026-09-16"), notes: "Ben joined Whispered this week: Slack workspace, Swarm network tool, RevOps huddle (every 3 weeks) and Member Huddle (every 2 weeks), both starting 9/18." },
  { id: "c-brent-wu", name: "Brent Wu", firm: "Geodesic Capital", type: "NETWORK", warmthTier: "WARM", cadenceTier: "TWO_WEEKS", notes: "Portco intros still pending (Island, ClickHouse, Glean, Saronic)." },
  { id: "c-phil-brace", name: "Phil Brace", type: "NETWORK", warmthTier: "WARM", cadenceTier: "TWO_WEEKS", notes: "Outreach sent via text, no reply logged." },
  { id: "c-kurt-beyer", name: "Kurt Beyer", type: "NETWORK", warmthTier: "COLD", cadenceTier: "FOUR_WEEKS", notes: "Still not contacted." },
];

const opportunities: OpportunitySeed[] = [
  { id: "o-companycam", company: "CompanyCam", role: "President", stage: "CONTACTED", status: "ACTIVE", sourceContactId: "c-blake-lindgren", nextAction: "Wait for Blake to connect with Luke Hansen (CEO)", nextActionOwner: "THEM", lastTouchDate: d("2026-09-16"), notes: "Ben applied gentle pressure Sep 16 9:38pm PT: other opportunities moving, nothing he'd choose over this, strong gut feeling. Nothing to send until Blake replies." },
  { id: "o-darktrace", company: "Darktrace", role: "Chief Strategy Officer", stage: "INTERVIEWING", status: "ACTIVE", sourceContactId: "c-jennifer-martin", nextAction: "Prep for David Smith (CPO) and Ed Jennings (CEO), both Mon 9/21", nextActionOwner: "BEN", lastTouchDate: d("2026-09-16"), notes: "Reports to CEO Ed Jennings. Moved from dormant to active scheduling same day. Internal codename \"Project Wallace.\"" },
  { id: "o-turnriver", company: "Turn/River Capital", role: "Operating Lead", stage: "SCREEN", status: "ACTIVE", sourceContactId: "c-elle-carroll", nextAction: "Prep for Saied Amiry, Tue 9/22", nextActionOwner: "BEN", lastTouchDate: d("2026-09-16"), notes: "Alvin Ang call already went well per prior debrief." },
  { id: "o-zoominfo", company: "ZoomInfo", role: "VP or SVP (scope TBD)", stage: "INTERVIEWING", status: "ACTIVE", sourceContactId: "c-james-roth", nextAction: "Wait for word on the Henry scope decision (wide = enablement + strategy/analytics, SVP-pushable; narrow = VP)", nextActionOwner: "THEM", lastTouchDate: d("2026-09-16"), notes: "All four Dreamforce meetings held Sep 16. Four thank-you notes sent that evening." },
  { id: "o-anaplan", company: "Anaplan", role: "GTM COO", stage: "CONTACTED", status: "ACTIVE", sourceContactId: "c-rob-lee", nextAction: "Wait for Greg Randolph's response", nextActionOwner: "THEM", lastTouchDate: d("2026-09-16"), notes: "Reports to Greg Randolph (President/CRO). Follow-up note sent Sep 16, 4:38pm PT (previously logged as drafted-not-sent, that's now stale — it went out)." },
  { id: "o-cherry", company: "Cherry Technologies", role: "CRO", stage: "SCREEN", status: "ACTIVE", sourceContactId: "c-brandon-self", nextAction: "Call with Felix, Thu 9/17, 7:30-7:50am PT", nextActionOwner: "BEN", lastTouchDate: d("2026-09-17"), notes: "This morning's call." },
  { id: "o-sublime", company: "Sublime Security", role: "CRO", stage: "SCREEN", status: "ACTIVE", sourceContactId: "c-ian-thiel", nextAction: "Prep for Ian, Tue 9/23", nextActionOwner: "BEN", notes: "Real date is Tue 9/23, 9:30-10am PT. The Fri 9/18 calendar hold is stale, delete it." },
  { id: "o-scaleai", company: "Scale AI", role: "TBD", stage: "SCREEN", status: "ACTIVE", sourceContactId: "c-trevor-thompson", nextAction: "Prep for Max, Fri 9/18", nextActionOwner: "BEN", notes: "Call confirmed Fri 9/18, 8:30-9:00am PT." },
  { id: "o-codemetal", company: "CodeMetal", role: "GM, War Matrix", stage: "SCREEN", status: "ACTIVE", sourceContactId: "c-zayn-knaub", nextAction: "Call with Charlie, Thu 9/17, 9:00-9:15am PT", nextActionOwner: "BEN", lastTouchDate: d("2026-09-17"), notes: "This morning's call, rescheduled off the earlier Wed 9/16 4pm PT slot. Charlie organizing and calling Ben." },
  { id: "o-gridaero", company: "Grid Aero", role: "TBD", stage: "SCREEN", status: "ACTIVE", sourceContactId: "c-jon-rezneck", nextAction: "Prep for the in-person, Mon 9/21", nextActionOwner: "BEN", notes: "In person, 795 Aladdin Ave, San Leandro. Resolves the earlier \"exact time pending.\"" },
  { id: "o-ironclad", company: "Ironclad", role: "GTM Ops", stage: "SCREEN", status: "ACTIVE", sourceContactId: "c-dan-streetman", nextAction: "Coffee with Helen Wang, Thu 9/17, 11:00-11:45am PT", nextActionOwner: "BEN", lastTouchDate: d("2026-09-17"), notes: "Later this morning. Note: Helen is CFO not the hiring exec; Elise Bergeron holds Chief Marketing & Strategy Officer." },
  { id: "o-uforce", company: "UFORCE", role: "TBD", stage: "LEAD", status: "ACTIVE", sourceContactId: "c-david-rothzeid", nextAction: "Wait for Brett's reply; consider re-pinging Oleg directly now that a recruiter track is open", nextActionOwner: "THEM", lastTouchDate: d("2026-09-16"), notes: "Two tracks into the same company: personal (Oleg Rogynskyy, no reply since August) and recruiter (Brett, via David Rothzeid). Run separately." },
  { id: "o-operatorsfund", company: "Operators Fund", role: "TBD", stage: "SCREEN", status: "ACTIVE", sourceContactId: "c-trevor-thompson", nextAction: "Prep for Alec, Mon 9/21", nextActionOwner: "BEN", notes: "Confirmed Mon 9/21, 9:00-9:30am PT, Google Meet." },
  { id: "o-syncro", company: "Syncro", role: "TBD", stage: "SCREEN", status: "STALLED", sourceContactId: "c-michael-george", lastTouchDate: d("2026-09-14"), notes: "Exploratory call went deeper than expected Sep 14, then no fresh movement found." },
  { id: "o-marco", company: "Marco Technologies", role: "TBD", stage: "CLOSED", status: "CLOSED_LOST", notes: "Closed/passed." },
  { id: "o-postpilot", company: "PostPilot", role: "TBD", stage: "CLOSED", status: "CLOSED_LOST", notes: "Closed/passed." },
];

const threads: ThreadSeed[] = [
  {
    id: "t-companycam", contactId: "c-blake-lindgren", opportunityId: "o-companycam",
    touches: [
      { date: d("2026-09-16"), summary: "Ben nudged Blake at 5:28pm PT asking if he'd connected with Luke Hansen.", direction: "BEN_OWES" },
      { date: d("2026-09-16"), summary: "Blake replied 9:26pm PT: still hasn't caught up with Luke, only high-level positive feedback so far, told Luke Ben is awaiting next steps.", direction: "THEY_OWE" },
      { date: d("2026-09-16"), summary: "Ben replied 9:38pm PT applying gentle pressure: other opportunities are moving, nothing he'd choose over CompanyCam, strong gut feeling.", direction: "THEY_OWE" },
    ],
  },
  {
    id: "t-darktrace-jennifer", contactId: "c-jennifer-martin", opportunityId: "o-darktrace",
    touches: [{ date: d("2026-09-16"), summary: "Calendar shows two Mon 9/21 blocks created 9:51-9:52pm PT: CPO hold and confirmed CEO Teams call, organized by Jennifer, cc'ing Katina Kushner.", direction: "FYI" }],
  },
  {
    id: "t-turnriver-elle", contactId: "c-elle-carroll", opportunityId: "o-turnriver",
    touches: [{ date: d("2026-09-16"), summary: "Zoom with Saied Amiry confirmed Tue 9/22, 10-11am PT, via Sarah Barrett.", direction: "FYI" }],
  },
  {
    id: "t-turnriver-alvin", contactId: "c-alvin-ang", opportunityId: "o-turnriver",
    touches: [{ date: d("2026-09-10"), summary: "Earlier call went well, per prior debrief.", direction: "FYI" }],
  },
  {
    id: "t-zoominfo-roth", contactId: "c-james-roth", opportunityId: "o-zoominfo",
    touches: [
      { date: d("2026-09-16"), summary: "Dreamforce meeting held.", direction: "FYI" },
      { date: d("2026-09-16"), summary: "Thank-you note sent 7:43pm PT.", direction: "BEN_OWES" },
    ],
  },
  {
    id: "t-zoominfo-andrew", contactId: "c-andrew-riesenfeld", opportunityId: "o-zoominfo",
    touches: [
      { date: d("2026-09-16"), summary: "Closing 1:1 held at Dreamforce.", direction: "FYI" },
      { date: d("2026-09-16"), summary: "Thank-you note sent 8:01pm PT. Andrew and James meeting CEO Henry that night to decide role scope.", direction: "THEY_OWE" },
    ],
  },
  {
    id: "t-anaplan-greg", contactId: "c-greg-randolph", opportunityId: "o-anaplan",
    touches: [{ date: d("2026-09-16"), summary: "GTM COO follow-up note sent 4:38pm PT (previously logged as drafted-not-sent — confirmed it went out).", direction: "THEY_OWE" }],
  },
  {
    id: "t-cherry-felix", contactId: "c-felix-steinmeyer", opportunityId: "o-cherry",
    touches: [{ date: d("2026-09-17"), summary: "Call confirmed 7:30-7:50am PT.", direction: "FYI" }],
  },
  {
    id: "t-sublime-ian", contactId: "c-ian-thiel", opportunityId: "o-sublime",
    touches: [{ date: d("2026-09-16"), summary: "Call confirmed for Tue 9/23, 9:30-10am PT (real date; Fri 9/18 hold on calendar is stale).", direction: "FYI" }],
  },
  {
    id: "t-scaleai-max", contactId: "c-max-lintott", opportunityId: "o-scaleai",
    touches: [{ date: d("2026-09-16"), summary: "Call confirmed Fri 9/18, 8:30-9:00am PT.", direction: "FYI" }],
  },
  {
    id: "t-codemetal-charlie", contactId: "c-charlie-harrison", opportunityId: "o-codemetal",
    touches: [{ date: d("2026-09-16"), summary: "Call rescheduled off Wed 9/16 4pm PT, now confirmed Thu 9/17 9:00-9:15am PT, Charlie organizing and calling Ben.", direction: "FYI" }],
  },
  {
    id: "t-gridaero-arthur", contactId: "c-arthur-dubois", opportunityId: "o-gridaero",
    touches: [{ date: d("2026-09-16"), summary: "In-person time now locked: Mon 9/21, 3-4pm PT, 795 Aladdin Ave, San Leandro.", direction: "FYI" }],
  },
  {
    id: "t-ironclad-helen", contactId: "c-helen-wang", opportunityId: "o-ironclad",
    touches: [{ date: d("2026-09-16"), summary: "Coffee confirmed Thu 9/17, 11:00-11:45am PT, Coffeebar Menlo Park.", direction: "FYI" }],
  },
  {
    id: "t-uforce-rothzeid", contactId: "c-david-rothzeid", opportunityId: "o-uforce",
    touches: [{ date: d("2026-09-16"), summary: "Connected Ben directly to Brett, a recruiter, at 7:44pm PT.", direction: "FYI" }],
  },
  {
    id: "t-uforce-brett", contactId: "c-brett-uforce", opportunityId: "o-uforce",
    touches: [{ date: d("2026-09-16"), summary: "Ben replied 8:05pm PT, moved David Rothzeid to bcc, asked about needs and availability.", direction: "BEN_OWES" }],
  },
  {
    id: "t-uforce-oleg", contactId: "c-oleg-rogynskyy", opportunityId: "o-uforce",
    touches: [{ date: d("2026-08-17"), summary: "Direct outreach in August (personal connection from People.ai). No reply on file.", direction: "BEN_OWES" }],
  },
  {
    id: "t-operatorsfund-alec", contactId: "c-alec-williams", opportunityId: "o-operatorsfund",
    touches: [{ date: d("2026-09-16"), summary: "Call confirmed Mon 9/21, 9:00-9:30am PT, Google Meet.", direction: "FYI" }],
  },
  {
    id: "t-syncro-michael", contactId: "c-michael-george", opportunityId: "o-syncro",
    touches: [{ date: d("2026-09-14"), summary: "Exploratory call went deeper than expected.", direction: "FYI" }],
  },
  {
    id: "t-justin-ossola", contactId: "c-justin-ossola",
    touches: [
      { date: d("2026-09-01"), summary: "30-day check-in scheduled.", direction: "FYI" },
      { date: d("2026-09-16"), summary: "New unread LinkedIn message from Justin, not yet checked.", direction: "THEY_OWE" },
    ],
  },
  {
    id: "t-emilie-pritchard", contactId: "c-emilie-pritchard",
    touches: [{ date: d("2026-09-14"), summary: "First call held. Debrief not yet given.", direction: "BEN_OWES" }],
  },
  {
    id: "t-emily-azevedo", contactId: "c-emily-azevedo",
    touches: [{ date: d("2026-09-14"), summary: "Sourced Syncro. Still owes intros to a Francisco Partners contact and an Hg contact.", direction: "THEY_OWE" }],
  },
  {
    id: "t-andy-mowat", contactId: "c-andy-mowat",
    touches: [{ date: d("2026-09-16"), summary: "Ben joined Whispered this week: Slack workspace, Swarm network tool, both recurring huddles now on calendar starting 9/18.", direction: "FYI" }],
  },
  {
    id: "t-lanai-lexi", contactId: "c-lanai-lexi",
    touches: [{ date: d("2026-09-16"), summary: "Meeting confirmed Thu 9/18, 4:00-4:30pm PT. Pure networking, not an opportunity.", direction: "FYI" }],
  },
];

const actionItems: ActionItemSeed[] = [
  { title: "Prep for David Smith (CPO) and Ed Jennings (CEO)", dueDate: d("2026-09-21"), opportunityId: "o-darktrace", contactId: "c-jennifer-martin" },
  { title: "Prep for Ian Thiel call", dueDate: d("2026-09-23"), opportunityId: "o-sublime", contactId: "c-ian-thiel" },
  { title: "Decide whether to re-ping Oleg directly now that the Brett recruiter track is live", dueDate: d("2026-09-19"), opportunityId: "o-uforce", contactId: "c-oleg-rogynskyy" },
  { title: "Check Justin Ossola's unread LinkedIn message", dueDate: d("2026-09-17"), contactId: "c-justin-ossola" },
  { title: "Give Emilie Pritchard a debrief on the Sep 14 call", dueDate: d("2026-09-17"), contactId: "c-emilie-pritchard" },
  { title: "Prep for Saied Amiry call", dueDate: d("2026-09-22"), opportunityId: "o-turnriver", contactId: "c-saied-amiry" },
  { title: "Prep for Max Lintott call", dueDate: d("2026-09-18"), opportunityId: "o-scaleai", contactId: "c-max-lintott" },
];

async function main() {
  for (const c of contacts) {
    await prisma.contact.create({ data: c });
  }
  console.log(`Contacts: ${contacts.length}`);

  for (const o of opportunities) {
    await prisma.opportunity.create({ data: o });
  }
  console.log(`Opportunities: ${opportunities.length}`);

  for (const t of threads) {
    await prisma.thread.create({
      data: {
        id: t.id,
        contactId: t.contactId,
        opportunityId: t.opportunityId,
        touches: { create: t.touches },
      },
    });
  }
  console.log(`Threads: ${threads.length}, touches: ${threads.reduce((n, t) => n + t.touches.length, 0)}`);

  for (const a of actionItems) {
    await prisma.actionItem.create({ data: { ...a, kind: "MANUAL" } });
  }
  console.log(`Action items: ${actionItems.length}`);

  // Raw thread/touch creation above doesn't run the app's logTouch side
  // effect that keeps Contact.lastTouchDate current, so derive it here:
  // each contact's lastTouchDate becomes the later of what was set
  // explicitly above and the most recent touch on any of their threads.
  let updated = 0;
  for (const c of contacts) {
    const contactThreads = threads.filter((t) => t.contactId === c.id);
    const touchDates = contactThreads.flatMap((t) => t.touches.map((touch) => touch.date));
    if (touchDates.length === 0) continue;
    const latestTouch = new Date(Math.max(...touchDates.map((dt) => dt.getTime())));
    const latestKnown = c.lastTouchDate && c.lastTouchDate > latestTouch ? c.lastTouchDate : latestTouch;
    await prisma.contact.update({ where: { id: c.id }, data: { lastTouchDate: latestKnown } });
    updated++;
  }
  console.log(`Contacts with lastTouchDate derived from touch history: ${updated}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
