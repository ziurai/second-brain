"use client";
import { useState, useEffect } from "react";

export default function WeatherGreeting() {
  const [temp, setTemp] = useState<number | null>(null);

  useEffect(() => {
    fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=42.9634&longitude=-85.6681&current=temperature_2m&temperature_unit=fahrenheit"
    )
      .then((r) => r.json())
      .then((data) => setTemp(Math.round(data.current.temperature_2m)))
      .catch(() => setTemp(null));
  }, []);

  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const weatherPart =
    temp !== null ? `${temp}°F` : "…";

  return (
    <p className="weather-greeting">
      Today is {dateStr} and the weather in Grand Rapids is {weatherPart}
    </p>
  );
}
