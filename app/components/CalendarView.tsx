"use client";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Plus, X, Trash2, Pencil, Save, MapPin, Clock, RefreshCw } from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface CalEvent {
  _id: Id<"events">;
  title: string;
  date: string;
  time?: string;
  endTime?: string;
  location?: string;
  notes?: string;
  recurrence?: string;
  order: number;
}

interface Countdown {
  _id: Id<"countdowns">;
  title: string;
  startDate: string;
  endDate?: string;
  order: number;
}

type EventForm = {
  title: string;
  date: string;
  time: string;
  endTime: string;
  location: string;
  notes: string;
  recurrence: string;
};

type CountdownForm = {
  title: string;
  startDate: string;
  endDate: string;
};

const EMPTY_EVENT: EventForm = { title: "", date: "", time: "", endTime: "", location: "", notes: "", recurrence: "" };
const EMPTY_COUNTDOWN: CountdownForm = { title: "", startDate: "", endDate: "" };

const RECURRENCE_LABELS: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  biweekly: "Every 2 wks",
  monthly: "Monthly",
  yearly: "Yearly",
};

// ─── Date helpers ────────────────────────────────────────────────────────────

function localDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function todayIso(): string {
  return new Date().toLocaleDateString("en-CA");
}

function isPast(iso: string): boolean {
  return iso < todayIso();
}

function isToday(iso: string): boolean {
  return iso === todayIso();
}

function formatShort(iso: string): { dow: string; md: string } {
  const dt = localDate(iso);
  return {
    dow: dt.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
    md: dt.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  };
}

function formatFull(iso: string): string {
  return localDate(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function formatTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function daysUntil(iso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = localDate(iso);
  return Math.ceil((target.getTime() - today.getTime()) / 86400000);
}

// For recurring events, compute the next display date from the base date
function nextOccurrence(baseDate: string, recurrence: string): string {
  const today = todayIso();
  if (baseDate >= today) return baseDate;
  const d = localDate(baseDate);
  while (d.toLocaleDateString("en-CA") < today) {
    if (recurrence === "daily") d.setDate(d.getDate() + 1);
    else if (recurrence === "weekly") d.setDate(d.getDate() + 7);
    else if (recurrence === "biweekly") d.setDate(d.getDate() + 14);
    else if (recurrence === "monthly") d.setMonth(d.getMonth() + 1);
    else if (recurrence === "yearly") d.setFullYear(d.getFullYear() + 1);
    else break;
  }
  return d.toLocaleDateString("en-CA");
}

function getDisplayDate(ev: CalEvent): string {
  if (ev.recurrence && isPast(ev.date)) return nextOccurrence(ev.date, ev.recurrence);
  return ev.date;
}

// Countdown label: "in X days", "today!", "ends in X days", etc.
function countdownLabel(c: Countdown): { text: string; active: boolean } {
  const today = todayIso();
  const expired = (c.endDate ?? c.startDate) < today;
  if (expired) return { text: "", active: false };

  const started = c.startDate <= today;
  if (started && c.endDate) {
    const d = daysUntil(c.endDate);
    if (d === 0) return { text: "ends today", active: true };
    return { text: `ends in ${d} day${d !== 1 ? "s" : ""}`, active: true };
  }

  const d = daysUntil(c.startDate);
  if (d === 0) return { text: "today!", active: true };
  if (d === 1) return { text: "tomorrow", active: true };
  return { text: `in ${d} days`, active: true };
}

// ─── EventRow (module-level to avoid remount on state change) ────────────────

function EventRow({
  ev,
  displayDate,
  onEdit,
  onDelete,
}: {
  ev: CalEvent;
  displayDate: string;
  onEdit: (ev: CalEvent) => void;
  onDelete: (id: Id<"events">) => void;
}) {
  const { dow, md } = formatShort(displayDate);
  const today = isToday(displayDate);
  return (
    <div className={`event-row${today ? " event-today" : ""}`}>
      <div className="event-date-col">
        <span className="event-dow">{dow}</span>
        <span className="event-md">{md}</span>
        {today && <span className="today-dot" />}
      </div>
      <div className="event-body">
        <div className="event-title-row">
          <span className="event-title">{ev.title}</span>
          {ev.recurrence && (
            <span className="recur-badge" title={RECURRENCE_LABELS[ev.recurrence]}>
              <RefreshCw size={9} /> {RECURRENCE_LABELS[ev.recurrence]}
            </span>
          )}
        </div>
        {(ev.time || ev.endTime) && (
          <div className="event-meta">
            <Clock size={10} />
            {ev.time ? formatTime(ev.time) : ""}
            {ev.endTime ? ` – ${formatTime(ev.endTime)}` : ""}
          </div>
        )}
        {ev.location && (
          <div className="event-meta">
            <MapPin size={10} /> {ev.location}
          </div>
        )}
        {ev.notes && <div className="event-notes">{ev.notes}</div>}
      </div>
      <div className="event-actions">
        <button className="ev-btn" onClick={() => onEdit(ev)}><Pencil size={11} /></button>
        <button className="ev-btn ev-delete" onClick={() => onDelete(ev._id)}><Trash2 size={11} /></button>
      </div>
    </div>
  );
}

// ─── EventFormFields (module-level) ──────────────────────────────────────────

function EventFormFields({
  f,
  setF,
}: {
  f: EventForm;
  setF: React.Dispatch<React.SetStateAction<EventForm>>;
}) {
  return (
    <div className="form">
      <div className="form-row">
        <label>Title *</label>
        <input placeholder="e.g. Team Meeting" value={f.title}
          onChange={(e) => setF((p) => ({ ...p, title: e.target.value }))} />
      </div>
      <div className="form-row-3">
        <div className="form-row">
          <label>Date *</label>
          <input type="date" value={f.date}
            onChange={(e) => setF((p) => ({ ...p, date: e.target.value }))} />
        </div>
        <div className="form-row">
          <label>Time</label>
          <input type="time" value={f.time}
            onChange={(e) => setF((p) => ({ ...p, time: e.target.value }))} />
        </div>
        <div className="form-row">
          <label>End Time</label>
          <input type="time" value={f.endTime}
            onChange={(e) => setF((p) => ({ ...p, endTime: e.target.value }))} />
        </div>
      </div>
      <div className="form-row-2">
        <div className="form-row">
          <label>Location</label>
          <input placeholder="e.g. Zoom" value={f.location}
            onChange={(e) => setF((p) => ({ ...p, location: e.target.value }))} />
        </div>
        <div className="form-row">
          <label>Repeats</label>
          <select value={f.recurrence} onChange={(e) => setF((p) => ({ ...p, recurrence: e.target.value }))}>
            <option value="">Does not repeat</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Every 2 weeks</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>
      <div className="form-row">
        <label>Notes</label>
        <textarea placeholder="Any additional details..." value={f.notes} rows={3}
          onChange={(e) => setF((p) => ({ ...p, notes: e.target.value }))} />
      </div>
    </div>
  );
}

// ─── CountdownRow (module-level) ─────────────────────────────────────────────

function CountdownRow({
  c,
  onEdit,
  onDelete,
}: {
  c: Countdown;
  onEdit: (c: Countdown) => void;
  onDelete: (id: Id<"countdowns">) => void;
}) {
  const { text } = countdownLabel(c);
  return (
    <div className="cd-row">
      <div className="cd-info">
        <div className="cd-title">{c.title}</div>
        <div className="cd-dates">
          {formatFull(c.startDate)}
          {c.endDate && ` – ${formatFull(c.endDate)}`}
        </div>
      </div>
      <div className="cd-label">{text}</div>
      <div className="cd-actions">
        <button className="ev-btn" onClick={() => onEdit(c)}><Pencil size={11} /></button>
        <button className="ev-btn ev-delete" onClick={() => onDelete(c._id)}><Trash2 size={11} /></button>
      </div>
    </div>
  );
}

// ─── CountdownFormFields (module-level) ──────────────────────────────────────

function CountdownFormFields({
  f,
  setF,
}: {
  f: CountdownForm;
  setF: React.Dispatch<React.SetStateAction<CountdownForm>>;
}) {
  return (
    <div className="form">
      <div className="form-row">
        <label>Title *</label>
        <input placeholder="e.g. Vacation" value={f.title}
          onChange={(e) => setF((p) => ({ ...p, title: e.target.value }))} />
      </div>
      <div className="form-row-2">
        <div className="form-row">
          <label>Start Date *</label>
          <input type="date" value={f.startDate}
            onChange={(e) => setF((p) => ({ ...p, startDate: e.target.value }))} />
        </div>
        <div className="form-row">
          <label>End Date</label>
          <input type="date" value={f.endDate}
            onChange={(e) => setF((p) => ({ ...p, endDate: e.target.value }))} />
        </div>
      </div>
    </div>
  );
}

// ─── CountdownSection (module-level, owns its own Convex state) ───────────────

function CountdownSection() {
  const countdowns = (useQuery(api.countdowns.list) ?? []) as Countdown[];
  const addCountdown = useMutation(api.countdowns.add);
  const updateCountdown = useMutation(api.countdowns.update);
  const removeCountdown = useMutation(api.countdowns.remove);

  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Countdown | null>(null);
  const [form, setForm] = useState<CountdownForm>(EMPTY_COUNTDOWN);
  const [editForm, setEditForm] = useState<CountdownForm>(EMPTY_COUNTDOWN);

  const active = countdowns.filter((c) => countdownLabel(c).active)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  const handleAdd = async () => {
    if (!form.title || !form.startDate) return;
    await addCountdown({
      title: form.title,
      startDate: form.startDate,
      endDate: form.endDate || undefined,
      order: countdowns.length,
    });
    setForm(EMPTY_COUNTDOWN);
    setShowAdd(false);
  };

  const openEdit = (c: Countdown) => {
    setEditing(c);
    setEditForm({ title: c.title, startDate: c.startDate, endDate: c.endDate ?? "" });
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    await updateCountdown({
      id: editing._id,
      title: editForm.title,
      startDate: editForm.startDate,
      endDate: editForm.endDate || undefined,
    });
    setEditing(null);
  };

  return (
    <section className="cd-section">
      <div className="cd-header">
        <span className="section-label">Upcoming Dates</span>
        <button className="ev-add-btn" onClick={() => setShowAdd(true)}>
          <Plus size={12} /> Add
        </button>
      </div>

      {active.length === 0 && !showAdd && (
        <div className="cd-empty">No upcoming dates. <button onClick={() => setShowAdd(true)}>Add one →</button></div>
      )}

      <div className="cd-grid">
        {active.map((c) => (
          <CountdownRow key={c._id} c={c} onEdit={openEdit} onDelete={(id) => removeCountdown({ id })} />
        ))}
      </div>

      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span>New Upcoming Date</span>
              <button onClick={() => setShowAdd(false)}><X size={16} /></button>
            </div>
            <CountdownFormFields f={form} setF={setForm} />
            <div className="modal-footer">
              <button className="submit-btn" onClick={handleAdd}><Save size={13} /> Save</button>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span>Edit Upcoming Date</span>
              <button onClick={() => setEditing(null)}><X size={16} /></button>
            </div>
            <CountdownFormFields f={editForm} setF={setEditForm} />
            <div className="modal-footer">
              <button className="submit-btn" onClick={handleSaveEdit}><Save size={13} /> Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ─── CalendarView ─────────────────────────────────────────────────────────────

export default function CalendarView() {
  const events = (useQuery(api.events.list) ?? []) as CalEvent[];
  const addEvent = useMutation(api.events.add);
  const updateEvent = useMutation(api.events.update);
  const removeEvent = useMutation(api.events.remove);

  const [showAdd, setShowAdd] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalEvent | null>(null);
  const [form, setForm] = useState<EventForm>(EMPTY_EVENT);
  const [editForm, setEditForm] = useState<EventForm>(EMPTY_EVENT);

  // Compute display dates, then filter to upcoming only
  const withDisplayDate = events.map((ev) => ({ ev, displayDate: getDisplayDate(ev) }));
  const upcoming = withDisplayDate
    .filter(({ ev, displayDate }) => ev.recurrence ? true : !isPast(displayDate))
    .sort((a, b) => {
      if (a.displayDate !== b.displayDate) return a.displayDate.localeCompare(b.displayDate);
      return (a.ev.time ?? "").localeCompare(b.ev.time ?? "");
    });

  const handleAdd = async () => {
    if (!form.title || !form.date) return;
    await addEvent({
      title: form.title,
      date: form.date,
      time: form.time || undefined,
      endTime: form.endTime || undefined,
      location: form.location || undefined,
      notes: form.notes || undefined,
      recurrence: form.recurrence || undefined,
      order: events.length,
    });
    setForm(EMPTY_EVENT);
    setShowAdd(false);
  };

  const openEdit = (ev: CalEvent) => {
    setEditingEvent(ev);
    setEditForm({
      title: ev.title,
      date: ev.date,
      time: ev.time ?? "",
      endTime: ev.endTime ?? "",
      location: ev.location ?? "",
      notes: ev.notes ?? "",
      recurrence: ev.recurrence ?? "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editingEvent) return;
    await updateEvent({
      id: editingEvent._id,
      title: editForm.title || undefined,
      date: editForm.date || undefined,
      time: editForm.time || undefined,
      endTime: editForm.endTime || undefined,
      location: editForm.location || undefined,
      notes: editForm.notes || undefined,
      recurrence: editForm.recurrence || undefined,
    });
    setEditingEvent(null);
  };

  return (
    <div className="cal-view">
      {/* Countdown section always at top */}
      <CountdownSection />

      <div className="cal-toolbar">
        <span className="section-label" style={{ marginBottom: 0 }}>Events</span>
        <button className="ev-add-btn" onClick={() => setShowAdd(true)}>
          <Plus size={12} /> Add Event
        </button>
      </div>

      {upcoming.length === 0 && (
        <div className="empty-state">
          No upcoming events. <button onClick={() => setShowAdd(true)}>Add one →</button>
        </div>
      )}

      <div className="event-list event-grid">
        {upcoming.map(({ ev, displayDate }) => (
          <EventRow
            key={ev._id}
            ev={ev}
            displayDate={displayDate}
            onEdit={openEdit}
            onDelete={(id) => removeEvent({ id })}
          />
        ))}
      </div>

      <div className="archive-link-row">
        <a href="/calendar-archive" className="archive-link">View past events →</a>
      </div>

      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span>New Event</span>
              <button onClick={() => setShowAdd(false)}><X size={16} /></button>
            </div>
            <EventFormFields f={form} setF={setForm} />
            <div className="modal-footer">
              <button className="submit-btn" onClick={handleAdd}><Save size={13} /> Save Event</button>
            </div>
          </div>
        </div>
      )}

      {editingEvent && (
        <div className="modal-overlay" onClick={() => setEditingEvent(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span>Edit Event</span>
              <button onClick={() => setEditingEvent(null)}><X size={16} /></button>
            </div>
            <EventFormFields f={editForm} setF={setEditForm} />
            <div className="modal-footer">
              <button className="submit-btn" onClick={handleSaveEdit}><Save size={13} /> Save Changes</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .cal-view { padding-bottom: 80px; }

        /* ── Countdown section ── */
        .cd-section {
          margin-bottom: 40px;
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 16px 20px;
          background: #ffffff03;
        }
        .cd-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .cd-empty {
          font-size: 11px;
          color: var(--text-muted);
          padding: 4px 0 2px;
        }
        .cd-empty button {
          background: none; border: none; color: var(--text-secondary);
          cursor: pointer; font-family: inherit; font-size: 11px;
        }
        .cd-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          column-gap: 24px;
        }
        .cd-row {
          display: grid;
          grid-template-columns: 1fr auto auto;
          align-items: center;
          gap: 12px;
          padding: 10px 0;
          border-top: 1px solid var(--border);
        }
        .cd-row:hover .cd-actions { opacity: 1; }
        .cd-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
        .cd-title {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
          letter-spacing: -0.01em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .cd-dates {
          font-size: 11px;
          color: var(--text-secondary);
        }
        .cd-label {
          font-size: 12px;
          color: #f87171;
          font-weight: 500;
          white-space: nowrap;
          min-width: 80px;
          text-align: right;
        }
        .cd-actions {
          display: flex;
          gap: 4px;
          opacity: 0;
          transition: opacity 0.15s;
        }

        /* ── Events toolbar ── */
        .cal-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .ev-add-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          background: #ffffff0a;
          border: 1px solid var(--border);
          color: var(--text-secondary);
          padding: 5px 12px;
          border-radius: 3px;
          cursor: pointer;
          font-family: inherit;
          font-size: 11px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          transition: all 0.15s;
        }
        .ev-add-btn:hover { border-color: var(--border-hover); color: var(--text-primary); background: #ffffff14; }

        /* ── Section label ── */
        .section-label {
          font-size: 9px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text-muted);
          display: block;
          margin-bottom: 8px;
        }

        /* ── Event list ── */
        .event-list { margin-top: 4px; }
        .event-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          column-gap: 32px;
        }
        .event-row {
          display: flex;
          gap: 20px;
          align-items: flex-start;
          padding: 14px 0;
          border-bottom: 1px solid var(--border);
          transition: background 0.12s;
        }
        .event-row:hover { background: #ffffff03; }
        .event-row:hover .event-actions { opacity: 1; }
        .event-today .event-md { color: #f87171; }

        .event-date-col {
          min-width: 52px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          padding-top: 2px;
        }
        .event-dow { font-size: 9px; letter-spacing: 0.1em; color: var(--text-muted); }
        .event-md { font-size: 13px; font-weight: 500; color: var(--text-secondary); white-space: nowrap; }
        .today-dot { width: 4px; height: 4px; border-radius: 50%; background: #f87171; margin-top: 2px; }

        .event-body { flex: 1; display: flex; flex-direction: column; gap: 4px; min-width: 0; }
        .event-title-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .event-title { font-size: 14px; font-weight: 500; color: var(--text-primary); letter-spacing: -0.01em; }
        .recur-badge {
          display: inline-flex; align-items: center; gap: 3px;
          font-size: 9px; color: var(--text-muted); letter-spacing: 0.06em;
          background: #ffffff08; border: 1px solid var(--border); border-radius: 2px; padding: 1px 5px;
        }
        .event-meta { display: flex; align-items: center; gap: 5px; font-size: 11px; color: var(--text-muted); }
        .event-notes { font-size: 11px; color: var(--text-muted); white-space: pre-wrap; opacity: 0.8; }

        .event-actions { display: flex; gap: 4px; opacity: 0; transition: opacity 0.15s; padding-top: 2px; }
        .ev-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 3px; display: flex; align-items: center; border-radius: 3px; transition: color 0.15s; }
        .ev-btn:hover { color: var(--text-secondary); }
        .ev-btn.ev-delete:hover { color: #f87171; }

        .archive-link-row { padding: 20px 0 4px; }
        .archive-link { font-size: 11px; color: var(--text-muted); text-decoration: none; transition: color 0.15s; }
        .archive-link:hover { color: var(--text-secondary); }

        /* ── Empty state ── */
        .empty-state { color: var(--text-muted); font-size: 12px; display: flex; gap: 12px; align-items: center; padding: 32px 0; }
        .empty-state button { background: none; border: none; color: var(--text-secondary); cursor: pointer; font-family: inherit; font-size: 12px; }

        /* ── Modal ── */
        .modal-overlay { position: fixed; inset: 0; background: #00000088; backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 20px; }
        .modal { background: #141414; border: 1px solid var(--border-hover); border-radius: 6px; width: 100%; max-width: 520px; overflow: hidden; }
        .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; border-bottom: 1px solid var(--border); font-size: 12px; letter-spacing: 0.05em; color: var(--text-secondary); }
        .modal-header button { background: none; border: none; color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; transition: color 0.15s; }
        .modal-header button:hover { color: var(--text-primary); }
        .modal-footer { padding: 0 18px 18px; }

        /* ── Form ── */
        .form { padding: 18px 18px 8px; display: flex; flex-direction: column; gap: 14px; }
        .form-row { display: flex; flex-direction: column; gap: 5px; }
        .form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .form-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
        .form-row label { font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-secondary); }
        .form-row input, .form-row textarea, .form-row select {
          background: var(--bg); border: 1px solid var(--border); color: var(--text-primary);
          padding: 7px 10px; border-radius: 3px; font-family: inherit; font-size: 12px;
          outline: none; transition: border-color 0.15s; resize: vertical; color-scheme: dark;
        }
        .form-row select option { background: #141414; }
        .form-row input:focus, .form-row textarea:focus, .form-row select:focus { border-color: var(--border-hover); }

        .submit-btn { display: flex; align-items: center; gap: 6px; justify-content: center; background: #ffffff0f; border: 1px solid var(--border-hover); color: var(--text-primary); padding: 9px 16px; border-radius: 3px; cursor: pointer; font-family: inherit; font-size: 12px; letter-spacing: 0.05em; transition: all 0.15s; width: 100%; }
        .submit-btn:hover { background: #ffffff18; }
      `}</style>
    </div>
  );
}
