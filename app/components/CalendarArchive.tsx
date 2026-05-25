"use client";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { MapPin, Clock, RefreshCw } from "lucide-react";

interface CalEvent {
  _id: Id<"events">;
  title: string;
  date: string;
  time?: string;
  endTime?: string;
  location?: string;
  notes?: string;
  recurrence?: string;
}

interface Countdown {
  _id: Id<"countdowns">;
  title: string;
  startDate: string;
  endDate?: string;
}

function todayIso() {
  return new Date().toLocaleDateString("en-CA");
}

function localDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatFull(iso: string): string {
  return localDate(iso).toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" });
}

function formatTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

export default function CalendarArchive() {
  const events = (useQuery(api.events.list) ?? []) as CalEvent[];
  const countdowns = (useQuery(api.countdowns.list) ?? []) as Countdown[];
  const today = todayIso();

  const pastEvents = events
    .filter((e) => !e.recurrence && e.date < today)
    .sort((a, b) => b.date.localeCompare(a.date));

  const expiredCountdowns = countdowns
    .filter((c) => (c.endDate ?? c.startDate) < today)
    .sort((a, b) => b.startDate.localeCompare(a.startDate));

  return (
    <div className="archive-view">
      {pastEvents.length === 0 && expiredCountdowns.length === 0 && (
        <p className="empty">Nothing archived yet.</p>
      )}

      {expiredCountdowns.length > 0 && (
        <section className="arch-section">
          <div className="arch-label">Expired Dates</div>
          {expiredCountdowns.map((c) => (
            <div key={c._id} className="arch-row">
              <span className="arch-title">{c.title}</span>
              <span className="arch-date">
                {formatFull(c.startDate)}
                {c.endDate && ` – ${formatFull(c.endDate)}`}
              </span>
            </div>
          ))}
        </section>
      )}

      {pastEvents.length > 0 && (
        <section className="arch-section">
          <div className="arch-label">Past Events</div>
          {pastEvents.map((ev) => (
            <div key={ev._id} className="arch-row arch-event">
              <div className="arch-date-col">
                <span className="arch-date">{formatFull(ev.date)}</span>
              </div>
              <div className="arch-body">
                <span className="arch-title">{ev.title}</span>
                {(ev.time || ev.endTime) && (
                  <span className="arch-meta">
                    <Clock size={10} />
                    {ev.time ? formatTime(ev.time) : ""}
                    {ev.endTime ? ` – ${formatTime(ev.endTime)}` : ""}
                  </span>
                )}
                {ev.location && (
                  <span className="arch-meta"><MapPin size={10} /> {ev.location}</span>
                )}
              </div>
            </div>
          ))}
        </section>
      )}

      <style>{`
        .archive-view { padding-top: 8px; }
        .empty { color: var(--text-muted); font-size: 13px; padding: 40px 0; }
        .arch-section { margin-bottom: 40px; }
        .arch-label {
          font-size: 9px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text-muted);
          padding-bottom: 8px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 4px;
        }
        .arch-row {
          display: flex;
          align-items: baseline;
          gap: 20px;
          padding: 11px 0;
          border-bottom: 1px solid var(--border);
          opacity: 0.6;
        }
        .arch-event { align-items: flex-start; }
        .arch-title { font-size: 13px; font-weight: 500; color: var(--text-primary); }
        .arch-date { font-size: 12px; color: var(--text-secondary); }
        .arch-date-col { min-width: 220px; }
        .arch-body { display: flex; flex-direction: column; gap: 3px; }
        .arch-meta { display: flex; align-items: center; gap: 5px; font-size: 11px; color: var(--text-muted); }
      `}</style>
    </div>
  );
}
