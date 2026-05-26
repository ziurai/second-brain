import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=42.9634&longitude=-85.6681&current=temperature_2m&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&timezone=America%2FDetroit",
      { next: { revalidate: 900 } }
    );
    const data = await res.json();
    return NextResponse.json({
      temp: Math.round(data.current.temperature_2m),
      high: Math.round(data.daily.temperature_2m_max[0]),
      low: Math.round(data.daily.temperature_2m_min[0]),
    });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 502 });
  }
}
