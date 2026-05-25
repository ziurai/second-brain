import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import { sendPush } from "../../../lib/sendPush";

export async function GET() {
  try {
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    const today = new Date().toLocaleDateString("en-CA");

    const [events, countdowns] = await Promise.all([
      convex.query(api.events.list),
      convex.query(api.countdowns.list),
    ]);

    const todayEvents = (events as { date: string; title: string }[]).filter(
      (e) => e.date === today,
    );
    const todayCountdowns = (countdowns as { startDate: string; title: string }[]).filter(
      (c) => c.startDate === today,
    );

    const parts: string[] = [];
    if (todayEvents.length > 0) {
      const titles = todayEvents.map((e) => e.title).slice(0, 3).join(", ");
      parts.push(titles + (todayEvents.length > 3 ? ` +${todayEvents.length - 3} more` : ""));
    }
    todayCountdowns.forEach((c) => parts.push(`${c.title} starts today`));

    await sendPush(
      "Good morning ☀️",
      parts.length > 0 ? parts.join(" · ") : "Have a great day!",
      "/calendar",
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Morning briefing error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
