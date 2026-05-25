"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Plus, Trash2, X } from "lucide-react";
import { burst } from "../lib/confetti";

interface Reminder {
  _id: Id<"reminders">;
  text: string;
  checked: boolean;
  order: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Reminders() {
  const pathname = usePathname();
  const reminders = (useQuery(api.reminders.list) ?? []) as Reminder[];
  const addReminder = useMutation(api.reminders.add);
  const toggleReminder = useMutation(api.reminders.toggle);
  const updateReminder = useMutation(api.reminders.update);
  const removeReminder = useMutation(api.reminders.remove);
  const removeChecked = useMutation(api.reminders.removeChecked);

  const [open, setOpen] = useState(false);
  const [newText, setNewText] = useState("");
  const [editingId, setEditingId] = useState<Id<"reminders"> | null>(null);
  const [editText, setEditText] = useState("");

  // Don't show on the splash/login page
  if (pathname === "/splash") return null;

  const unchecked = reminders.filter((r) => !r.checked).sort((a, b) => a.order - b.order);
  const checked = reminders.filter((r) => r.checked).sort((a, b) => a.order - b.order);

  const handleAdd = async () => {
    const txt = newText.trim();
    if (!txt) return;
    await addReminder({ text: txt, checked: false, order: reminders.length });
    setNewText("");
  };

  const handleToggle = async (r: Reminder, el: HTMLElement) => {
    if (!r.checked) burst(el);
    await toggleReminder({ id: r._id, checked: !r.checked });
  };

  const startEdit = (r: Reminder) => {
    setEditingId(r._id);
    setEditText(r.text);
  };

  const saveEdit = async () => {
    if (editingId && editText.trim()) {
      await updateReminder({ id: editingId, text: editText.trim() });
    }
    setEditingId(null);
  };

  return (
    <>
      {/* Backdrop */}
      {open && <div className="rem-backdrop" onClick={() => setOpen(false)} />}

      {/* Panel */}
      {open && (
        <div className="rem-panel">
          <div className="rem-header">
            <span className="rem-title">Reminders</span>
            <div className="rem-header-right">
              {checked.length > 0 && (
                <button
                  className="rem-clear"
                  onClick={() => removeChecked()}
                  title="Clear all done"
                >
                  <Trash2 size={11} /> Clear done
                </button>
              )}
              <button className="rem-close" onClick={() => setOpen(false)}>
                <X size={14} />
              </button>
            </div>
          </div>

          <div className="rem-add-row">
            <input
              className="rem-input"
              placeholder="Add a reminder..."
              value={newText}
              autoFocus
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
            />
            <button className="rem-add-btn" onClick={handleAdd}>
              <Plus size={15} />
            </button>
          </div>

          <div className="rem-list">
            {reminders.length === 0 && (
              <p className="rem-empty">No reminders yet.</p>
            )}

            {unchecked.map((r) => (
              <div key={r._id} className="rem-item">
                <button
                  className="rem-check"
                  onClick={(e) => handleToggle(r, e.currentTarget)}
                />
                {editingId === r._id ? (
                  <input
                    className="rem-edit-input"
                    value={editText}
                    autoFocus
                    onChange={(e) => setEditText(e.target.value)}
                    onBlur={saveEdit}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit();
                      if (e.key === "Escape") setEditingId(null);
                    }}
                  />
                ) : (
                  <span className="rem-text" onDoubleClick={() => startEdit(r)}>
                    {r.text}
                  </span>
                )}
                <button className="rem-del" onClick={() => removeReminder({ id: r._id })}>
                  <X size={10} />
                </button>
              </div>
            ))}

            {checked.length > 0 && unchecked.length > 0 && (
              <div className="rem-divider" />
            )}

            {checked.map((r) => (
              <div key={r._id} className="rem-item rem-item-done">
                <button
                  className="rem-check rem-check-done"
                  onClick={(e) => handleToggle(r, e.currentTarget)}
                >
                  <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                    <path d="M1 4L4 7.5L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <span className="rem-text rem-text-done">{r.text}</span>
                <button className="rem-del" onClick={() => removeReminder({ id: r._id })}>
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAB */}
      <button className="rem-fab" onClick={() => setOpen((o) => !o)}>
        Reminders
        {unchecked.length > 0 && (
          <span className="rem-fab-badge">{unchecked.length}</span>
        )}
      </button>

      <style>{`
        .rem-backdrop {
          position: fixed;
          inset: 0;
          z-index: 198;
        }

        .rem-fab {
          position: fixed;
          bottom: 32px;
          right: 32px;
          z-index: 200;
          display: flex;
          align-items: center;
          gap: 8px;
          background: #141414;
          border: 1px solid var(--border-hover);
          color: var(--text-secondary);
          font-family: inherit;
          font-size: 11px;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          padding: 10px 20px;
          border-radius: 99px;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
          transition: all 0.15s;
        }
        .rem-fab:hover {
          border-color: var(--text-muted);
          color: var(--text-primary);
          background: #1c1c1c;
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(0,0,0,0.6);
        }
        .rem-fab-badge {
          background: #dc2626;
          color: #fff;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0;
          border-radius: 99px;
          min-width: 17px;
          height: 17px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
        }

        .rem-panel {
          position: fixed;
          bottom: 84px;
          right: 32px;
          z-index: 199;
          width: 310px;
          background: #141414;
          border: 1px solid var(--border-hover);
          border-radius: 12px;
          box-shadow: 0 12px 48px rgba(0,0,0,0.7);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: rem-slide-up 0.18s ease;
        }
        @keyframes rem-slide-up {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }

        .rem-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 13px 14px 11px;
          border-bottom: 1px solid var(--border);
        }
        .rem-title {
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-secondary);
        }
        .rem-header-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .rem-clear {
          display: flex;
          align-items: center;
          gap: 4px;
          background: none;
          border: none;
          color: var(--text-muted);
          font-family: inherit;
          font-size: 10px;
          letter-spacing: 0.04em;
          cursor: pointer;
          padding: 2px 4px;
          border-radius: 3px;
          transition: color 0.15s;
        }
        .rem-clear:hover { color: #f87171; }
        .rem-close {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 2px;
          transition: color 0.15s;
        }
        .rem-close:hover { color: var(--text-primary); }

        .rem-add-row {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 12px;
          border-bottom: 1px solid var(--border);
        }
        .rem-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-primary);
          font-family: inherit;
          font-size: 13px;
        }
        .rem-input::placeholder { color: var(--text-muted); }
        .rem-add-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 2px;
          transition: color 0.15s;
        }
        .rem-add-btn:hover { color: var(--text-primary); }

        .rem-list {
          overflow-y: auto;
          max-height: 380px;
          padding: 6px 0;
        }
        .rem-empty {
          font-size: 12px;
          color: var(--text-muted);
          padding: 16px 14px;
          margin: 0;
        }

        .rem-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 14px;
          transition: background 0.1s;
        }
        .rem-item:hover { background: #ffffff04; }
        .rem-item:hover .rem-del { opacity: 1; }

        .rem-check {
          width: 20px;
          height: 20px;
          min-width: 20px;
          border-radius: 50%;
          border: 1.5px solid #555;
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: border-color 0.15s, background 0.15s, transform 0.1s;
          flex-shrink: 0;
        }
        .rem-check:hover {
          border-color: #22c55e;
          background: #22c55e18;
          transform: scale(1.1);
        }
        .rem-check-done {
          background: #22c55e;
          border-color: #22c55e;
        }
        .rem-check-done:hover {
          background: #16a34a;
          border-color: #16a34a;
        }

        .rem-text {
          flex: 1;
          font-size: 13px;
          color: var(--text-primary);
          line-height: 1.4;
          cursor: default;
          user-select: none;
        }
        .rem-item-done { opacity: 0.45; }
        .rem-text-done {
          text-decoration: line-through;
          color: var(--text-muted);
        }

        .rem-edit-input {
          flex: 1;
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--border-hover);
          outline: none;
          color: var(--text-primary);
          font-family: inherit;
          font-size: 13px;
          padding: 0 0 1px;
        }

        .rem-del {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 2px;
          opacity: 0;
          transition: color 0.15s, opacity 0.15s;
          flex-shrink: 0;
        }
        .rem-del:hover { color: #f87171; }

        .rem-divider {
          height: 1px;
          background: var(--border);
          margin: 6px 14px;
        }
      `}</style>
    </>
  );
}
