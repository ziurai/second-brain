"use node";
import webpush from "web-push";
import { action, internalAction, ActionCtx } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";

function initVapid() {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );
}

async function pushToAll(
  ctx: ActionCtx,
  title: string,
  body: string,
  url: string,
) {
  initVapid();
  const subs = await ctx.runQuery(api.pushSubscriptions.list);
  if (subs.length === 0) return;
  const payload = JSON.stringify({ title, body, url });
  await Promise.all(
    subs.map((sub) =>
      webpush
        .sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
        )
        .catch(async (err: { statusCode?: number }) => {
          if (err.statusCode === 410 || err.statusCode === 404) {
            await ctx.runMutation(api.pushSubscriptions.remove, { endpoint: sub.endpoint });
          }
        }),
    ),
  );
}

export const send = action({
  args: {
    title: v.string(),
    body: v.string(),
    url: v.optional(v.string()),
  },
  handler: async (ctx, { title, body, url }) => {
    await pushToAll(ctx, title, body, url ?? "/");
  },
});

export const morningBriefing = internalAction({
  args: {},
  handler: async (ctx) => {
    const today = new Date().toLocaleDateString("en-CA");
    const [events, countdowns] = await Promise.all([
      ctx.runQuery(api.events.list),
      ctx.runQuery(api.countdowns.list),
    ]);

    const todayEvents = (events as { date: string }[]).filter((e) => e.date === today);
    const todayCountdowns = (countdowns as { startDate: string; title: string }[]).filter(
      (c) => c.startDate === today,
    );

    const parts: string[] = [];
    if (todayEvents.length > 0) {
      parts.push(`${todayEvents.length} event${todayEvents.length > 1 ? "s" : ""} today`);
    }
    if (todayCountdowns.length > 0) {
      parts.push(todayCountdowns.map((c) => c.title).join(", ") + " starts today");
    }

    await pushToAll(
      ctx,
      "Good morning ☀️",
      parts.length > 0 ? parts.join(" · ") : "Have a great day!",
      "/calendar",
    );
  },
});
