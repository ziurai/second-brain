import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// 8am Eastern (12:00 UTC covers EDT; adjust to 13:00 UTC for EST)
crons.cron("morning briefing", "0 12 * * *", internal.push.morningBriefing, {});

export default crons;
