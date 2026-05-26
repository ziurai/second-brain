"use client";
import { useState, useEffect } from "react";

export default function WeatherGreeting() {
  const [temp, setTemp] = useState<number | null>(null);
  const [high, setHigh] = useState<number | null>(null);
  const [low, setLow] = useState<number | null>(null);
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    setDateStr(
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    );

    fetch("/api/weather")
      .then((r) => r.json())
      .then((data) => {
        setTemp(data.temp);
        setHigh(data.high);
        setLow(data.low);
      })
      .catch(() => {});
  }, []);

  return (
    <p className="weather-greeting">
      {dateStr ? (
        <>
          Today is {dateStr} and the weather in Grand Rapids is{" "}
          {temp !== null ? (
            <span className="weather-temps">
              <span className="temp-current">{temp}°F</span>
              {high !== null && <span className="temp-hi">↑{high}°</span>}
              {low !== null && <span className="temp-lo">↓{low}°</span>}
            </span>
          ) : "…"}
        </>
      ) : null}
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
