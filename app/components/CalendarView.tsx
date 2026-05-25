"use client";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Plus, X, Trash2, Pencil, Save, MapPin, Clock } from "lucide-react";

interface CalEvent {
  _id: Id<"events">;
  title: string;
  date: string;
  time?: string;
  endTime?: string;
  location?: string;
  notes?: string;
  order: number;
}

type EventForm = {
  title: string;
  date: string;
  time: string;
  endTime: string;
  location: string;
  notes: string;
};

const EMPTY_FORM: EventForm = {
  title: "",
  date: "",
  time: "",
  endTime: "",
  location: "",
  notes: "",
};

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return {
    dayOfWeek: dt.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
    monthDay: dt.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    full: dt.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }),
    iso,
  };
}

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = h % 12 || 12;
  return `${hr}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function isToday(iso: string) {
  return iso === new Date().toLocaleDateString("en-CA");
}

function isPast(iso: string) {
  return iso < new Date().toLocaleDateString("en-CA");
}

export default function CalendarView() {
  const events = (useQuery(api.events.list) ?? []) as CalEvent[];
  const addEvent = useMutation(api.events.add);
  const updateEvent = useMutation(api.events.update);
  const removeEvent = useMutation(api.events.remove);

  const [showAdd, setShowAdd] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalEvent | null>(null);
  const [form, setForm] = useState<EventForm>(EMPTY_FORM);
  const [editForm, setEditForm] = useState<EventForm>(EMPTY_FORM);

  const sorted = [...events].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return (a.time ?? "").localeCompare(b.time ?? "");
  });

  const upcoming = sorted.filter((e) => !isPast(e.date));
  const past = sorted.filter((e) => isPast(e.date)).reverse();

  const handleAdd = async () => {
    if (!form.title || !form.date) return;
    await addEvent({
      title: form.title,
      date: form.date,
      time: form.time || undefined,
      endTime: form.endTime || undefined,
      location: form.location || undefined,
      notes: form.notes || undefined,
      order: events.length,
    });
    setForm(EMPTY_FORM);
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
    });
    setEditingEvent(null);
  };

  const EventRow = ({ ev, dim }: { ev: CalEvent; dim?: boolean }) => {
    const d = formatDate(ev.date);
    const today = isToday(ev.date);
    return (
      <div className={`event-row${dim ? " event-past" : ""}${today ? " event-today" : ""}`}>
        <div className="event-date-col">
          <span className="event-dow">{d.dayOfWeek}</span>
          <span className="event-md">{d.monthDay}</span>
          {today && <span className="today-dot" />}
        </div>
        <div className="event-body">
          <div className="event-title">{ev.title}</div>
          {(ev.time || ev.endTime) && (
            <div className="event-meta">
              <Clock size={10} />
              {ev.time ? formatTime(ev.time) : ""}
              {ev.endTime ? ` – ${formatTime(ev.endTime)}` : ""}
            </div>
          )}
          {ev.location && (
            <div className="event-meta">
              <MapPin size={10} />
              {ev.location}
            </div>
          )}
          {ev.notes && <div className="event-notes">{ev.notes}</div>}
        </div>
        <div className="event-actions">
          <button className="ev-btn" onClick={() => openEdit(ev)}><Pencil size={11} /></button>
          <button className="ev-btn ev-delete" onClick={() => removeEvent({ id: ev._id })}><Trash2 size={11} /></button>
        </div>
      </div>
    );
  };

  const EventFormFields = ({
    f,
    setF,
  }: {
    f: EventForm;
    setF: (fn: (p: EventForm) => EventForm) => void;
  }) => (
    <div className="form">
      <div className="form-row">
        <label>Title *</label>
        <input
          placeholder="e.g. Team Meeting"
          value={f.title}
          onChange={(e) => setF((p) => ({ ...p, title: e.target.value }))}
        />
      </div>
      <div className="form-row-2">
        <div className="form-row">
          <label>Date *</label>
          <input
            type="date"
            value={f.date}
            onChange={(e) => setF((p) => ({ ...p, date: e.target.value }))}
          />
        </div>
        <div className="form-row">
          <label>Time</label>
          <input
            type="time"
            value={f.time}
            onChange={(e) => setF((p) => ({ ...p, time: e.target.value }))}
          />
        </div>
        <div className="form-row">
          <label>End Time</label>
          <input
            type="time"
            value={f.endTime}
            onChange={(e) => setF((p) => ({ ...p, endTime: e.target.value }))}
          />
        </div>
      </div>
      <div className="form-row">
        <label>Location</label>
        <input
          placeholder="e.g. Zoom, Coffee Shop"
          value={f.location}
          onChange={(e) => setF((p) => ({ ...p, location: e.target.value }))}
        />
      </div>
      <div className="form-row">
        <label>Notes</label>
        <textarea
          placeholder="Any additional details..."
          value={f.notes}
          onChange={(e) => setF((p) => ({ ...p, notes: e.target.value }))}
          rows={3}
        />
      </div>
    </div>
  );

  return (
    <div className="cal-view">
      <div className="cal-toolbar">
        <button className="add-event-btn" onClick={() => setShowAdd(true)}>
          <Plus size={14} /> Add Event
        </button>
      </div>

      {upcoming.length === 0 && past.length === 0 && (
        <div className="empty-state">
          No events yet. <button onClick={() => setShowAdd(true)}>Add one →</button>
        </div>
      )}

      {upcoming.length > 0 && (
        <section className="event-section">
          <div className="section-label">Upcoming</div>
          {upcoming.map((ev) => (
            <EventRow key={ev._id} ev={ev} />
          ))}
        </section>
      )}

      {past.length > 0 && (
        <section className="event-section">
          <div className="section-label past-label">Past</div>
          {past.map((ev) => (
            <EventRow key={ev._id} ev={ev} dim />
          ))}
        </section>
      )}

      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span>New Event</span>
              <button onClick={() => setShowAdd(false)}><X size={16} /></button>
            </div>
            <EventFormFields f={form} setF={setForm} />
            <div className="modal-footer">
              <button className="submit-btn" onClick={handleAdd}>
                <Save size={13} /> Save Event
              </button>
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
              <button className="submit-btn" onClick={handleSaveEdit}>
                <Save size={13} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .cal-view { padding-bottom: 80px; }

        .cal-toolbar {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 24px;
        }

        .add-event-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #ffffff0a;
          border: 1px solid var(--border);
          color: var(--text-secondary);
          padding: 6px 16px;
          border-radius: 3px;
          cursor: pointer;
          font-family: inherit;
          font-size: 11px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          transition: all 0.15s;
        }
        .add-event-btn:hover { border-color: var(--border-hover); color: var(--text-primary); background: #ffffff14; }

        .event-section { margin-bottom: 40px; }

        .section-label {
          font-size: 9px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 8px;
          padding-bottom: 8px;
          border-bottom: 1px solid var(--border);
        }
        .past-label { opacity: 0.6; }

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

        .event-today .event-date-col { position: relative; }
        .event-today .event-md { color: #f87171; }

        .event-past { opacity: 0.45; }

        .event-date-col {
          min-width: 52px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          padding-top: 2px;
        }
        .event-dow {
          font-size: 9px;
          letter-spacing: 0.1em;
          color: var(--text-muted);
        }
        .event-md {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
          white-space: nowrap;
        }
        .today-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #f87171;
          margin-top: 2px;
        }

        .event-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }
        .event-title {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
          letter-spacing: -0.01em;
        }
        .event-meta {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          color: var(--text-muted);
        }
        .event-notes {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 2px;
          white-space: pre-wrap;
          opacity: 0.8;
        }

        .event-actions {
          display: flex;
          gap: 4px;
          opacity: 0;
          transition: opacity 0.15s;
          padding-top: 2px;
        }
        .ev-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 3px;
          display: flex;
          align-items: center;
          border-radius: 3px;
          transition: color 0.15s;
        }
        .ev-btn:hover { color: var(--text-secondary); }
        .ev-btn.ev-delete:hover { color: #f87171; }

        .empty-state {
          color: var(--text-muted);
          font-size: 12px;
          display: flex;
          gap: 12px;
          align-items: center;
          padding: 40px 0;
        }
        .empty-state button {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          font-family: inherit;
          font-size: 12px;
        }
        .empty-state button:hover { color: var(--text-primary); }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: #00000088;
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 20px;
        }
        .modal {
          background: #141414;
          border: 1px solid var(--border-hover);
          border-radius: 6px;
          width: 100%;
          max-width: 520px;
          overflow: hidden;
        }
        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px;
          border-bottom: 1px solid var(--border);
          font-size: 12px;
          letter-spacing: 0.05em;
          color: var(--text-secondary);
        }
        .modal-header button {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: color 0.15s;
        }
        .modal-header button:hover { color: var(--text-primary); }
        .modal-footer {
          padding: 0 18px 18px;
        }

        .form {
          padding: 18px 18px 8px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .form-row {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 10px;
        }
        .form-row label {
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-secondary);
        }
        .form-row input, .form-row textarea {
          background: var(--bg);
          border: 1px solid var(--border);
          color: var(--text-primary);
          padding: 7px 10px;
          border-radius: 3px;
          font-family: inherit;
          font-size: 12px;
          outline: none;
          transition: border-color 0.15s;
          resize: vertical;
          color-scheme: dark;
        }
        .form-row input:focus, .form-row textarea:focus { border-color: var(--border-hover); }

        .submit-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          justify-content: center;
          background: #ffffff0f;
          border: 1px solid var(--border-hover);
          color: var(--text-primary);
          padding: 9px 16px;
          border-radius: 3px;
          cursor: pointer;
          font-family: inherit;
          font-size: 12px;
          letter-spacing: 0.05em;
          transition: all 0.15s;
          width: 100%;
        }
        .submit-btn:hover { background: #ffffff18; }
      `}</style>
    </div>
  );
}
