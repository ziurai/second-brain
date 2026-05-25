"use client";
import { useState, useEffect } from "react";

export default function WeatherGreeting() {
  const [temp, setTemp] = useState<number | null>(null);
  const [high, setHigh] = useState<number | null>(null);
  const [low, setLow] = useState<number | null>(null);

  useEffect(() => {
    fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=42.9634&longitude=-85.6681&current=temperature_2m&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&timezone=America%2FDetroit"
    )
      .then((r) => r.json())
      .then((data) => {
        setTemp(Math.round(data.current.temperature_2m));
        setHigh(Math.round(data.daily.temperature_2m_max[0]));
        setLow(Math.round(data.daily.temperature_2m_min[0]));
      })
      .catch(() => {});
  }, []);

  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <p className="weather-greeting">
      Today is {dateStr} and the weather in Grand Rapids is{" "}
      {temp !== null ? (
        <span className="weather-temps">
          <span className="temp-current">{temp}°F</span>
          {high !== null && <span className="temp-hi">↑{high}°</span>}
          {low !== null && <span className="temp-lo">↓{low}°</span>}
        </span>
      ) : "…"}
      <style>{`
        .weather-temps {
          display: inline-flex;
          align-items: baseline;
          gap: 7px;
        }
        .temp-current {
          color: inherit;
        }
        .temp-hi {
          color: #f87171;
          font-size: 15px;
          font-weight: 400;
        }
        .temp-lo {
          color: #60a5fa;
          font-size: 15px;
          font-weight: 400;
        }
      `}</style>
    </p>
  );
}
