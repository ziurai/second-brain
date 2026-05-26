import { NextResponse } from "next/server";

// Hardcoded NWS gridpoint for Grand Rapids, MI (GRR office, grid 58,33)
const FORECAST_URL = "https://api.weather.gov/gridpoints/GRR/58,33/forecast";
const HOURLY_URL = "https://api.weather.gov/gridpoints/GRR/58,33/forecast/hourly";
const NWS_HEADERS = { "User-Agent": "second-brain-app/1.0" };

export async function GET() {
  try {
    const [forecastRes, hourlyRes] = await Promise.all([
      fetch(FORECAST_URL, { headers: NWS_HEADERS, cache: "no-store" }),
      fetch(HOURLY_URL, { headers: NWS_HEADERS, cache: "no-store" }),
    ]);

    if (!forecastRes.ok || !hourlyRes.ok) {
      return NextResponse.json({ error: "unavailable" }, { status: 502 });
    }

    const [forecast, hourly] = await Promise.all([forecastRes.json(), hourlyRes.json()]);

    const periods: { temperature: number; isDaytime: boolean }[] = forecast.properties.periods;
    const temp: number = hourly.properties.periods[0].temperature;
    const dayPeriod = periods.find((p) => p.isDaytime);
    const nightPeriod = periods.find((p) => !p.isDaytime);

    return NextResponse.json({
      temp,
      high: dayPeriod?.temperature ?? null,
      low: nightPeriod?.temperature ?? null,
    });
  } catch (e) {
    console.error("weather fetch error:", e);
    return NextResponse.json({ error: "unavailable" }, { status: 502 });
  }
}
