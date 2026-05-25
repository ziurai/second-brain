import webpush from "web-push";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

let vapidSet = false;
function ensureVapid() {
  if (vapidSet) return;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );
  vapidSet = true;
}

export async function sendPush(title: string, body: string, url = "/") {
  ensureVapid();
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  const subs = await convex.query(api.pushSubscriptions.list);
  if (subs.length === 0) return 0;

  let sent = 0;
  await Promise.all(
    subs.map((sub) =>
      webpush
        .sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify({ title, body, url }),
        )
        .then(() => { sent++; })
        .catch(() => {}),
    ),
  );
  return sent;
}
