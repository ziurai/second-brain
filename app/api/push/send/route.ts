import { NextResponse } from "next/server";
import { sendPush } from "../../../lib/sendPush";

export async function POST(req: Request) {
  try {
    const { title, body, url } = await req.json();
    const sent = await sendPush(title, body, url);
    return NextResponse.json({ ok: true, sent });
  } catch (err) {
    console.error("Push send error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
