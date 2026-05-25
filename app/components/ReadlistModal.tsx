"use client";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Plus, X } from "lucide-react";
import { burst } from "../lib/confetti";

interface ReadlistItem {
  _id: Id<"readlist">;
  title: string;
  read: boolean;
  order: number;
}

// Module-level to prevent focus loss on re-renders
function RLItemRow({ item, onToggle, onSave, onRemove }: {
  item: ReadlistItem;
  onToggle: (el: HTMLElement) => void;
  onSave: (title: string) => void;
  onRemove: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);

  const save = () => {
    if (editTitle.trim()) onSave(editTitle.trim());
    setEditing(false);
  };

  return (
    <div className={`wl-item${item.read ? " wl-item-done" : ""}`}>
      <button
        className={`wl-check${item.read ? " wl-check-done" : ""}`}
        onClick={(e) => onToggle(e.currentTarget)}
      >
        {item.read && (
          <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
            <path d="M1 4L4 7.5L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      {editing ? (
        <input
          className="wl-edit-input"
          value={editTitle}
          autoFocus
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
        />
      ) : (
        <span
          className={`wl-title${item.read ? " wl-title-done" : ""}`}
          style={{ flex: 1, cursor: "default", userSelect: "none" }}
          onDoubleClick={!item.read ? () => { setEditTitle(item.title); setEditing(true); } : undefined}
        >
          {item.title}
        </span>
      )}
      <button className="wl-del" onClick={onRemove}><X size={10} /></button>
    </div>
  );
}

export default function ReadlistModal({ onClose }: { onClose: () => void }) {
  const items = (useQuery(api.readlist.list) ?? []) as ReadlistItem[];
  const addItem = useMutation(api.readlist.add);
  const toggleItem = useMutation(api.readlist.toggle);
  const updateItem = useMutation(api.readlist.update);
  const removeItem = useMutation(api.readlist.remove);

  const [tab, setTab] = useState<"unread" | "read">("unread");
  const [newTitle, setNewTitle] = useState("");

  const unread = items.filter((i) => !i.read).sort((a, b) => a.order - b.order);
  const read = items.filter((i) => i.read).sort((a, b) => a.order - b.order);
  const displayed = tab === "unread" ? unread : read;

  const handleAdd = async () => {
    const txt = newTitle.trim();
    if (!txt) return;
    await addItem({ title: txt, read: false, order: items.length });
    setNewTitle("");
  };

  const handleToggle = async (item: ReadlistItem, el: HTMLElement) => {
    if (!item.read) burst(el);
    await toggleItem({ id: item._id, read: !item.read });
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal wl-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <span>📚 Books</span>
            <button onClick={onClose}><X size={16} /></button>
          </div>

          <div className="wl-tabs">
            <button
              className={`wl-tab${tab === "unread" ? " active" : ""}`}
              onClick={() => setTab("unread")}
            >
              Unread
              {unread.length > 0 && <span className="wl-tab-badge">{unread.length}</span>}
            </button>
            <button
              className={`wl-tab${tab === "read" ? " active" : ""}`}
              onClick={() => setTab("read")}
            >
              Read
            </button>
          </div>

          {tab === "unread" && (
            <div className="wl-add-row">
              <input
                className="wl-add-input"
                placeholder="Add book title..."
                value={newTitle}
                autoFocus
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
              />
              <button className="wl-add-btn" onClick={handleAdd}><Plus size={14} /></button>
            </div>
          )}

          <div className="wl-list">
            {displayed.length === 0 && (
              <p className="wl-empty">
                {tab === "unread" ? "No books on your list yet." : "Nothing read yet."}
              </p>
            )}
            {displayed.map((item) => (
              <RLItemRow
                key={item._id}
                item={item}
                onToggle={(el) => handleToggle(item, el)}
                onSave={(title) => updateItem({ id: item._id, title })}
                onRemove={() => removeItem({ id: item._id })}
              />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .modal-overlay { position: fixed; inset: 0; background: #00000088; backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 20px; }
        .modal { background: #141414; border: 1px solid var(--border-hover); border-radius: 6px; width: 100%; max-width: 480px; overflow: hidden; }
        .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; border-bottom: 1px solid var(--border); font-size: 12px; letter-spacing: 0.05em; color: var(--text-secondary); }
        .modal-header button { background: none; border: none; color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; transition: color 0.15s; }
        .modal-header button:hover { color: var(--text-primary); }

        .wl-tabs { display: flex; border-bottom: 1px solid var(--border); }
        .wl-tab { flex: 1; background: none; border: none; border-bottom: 2px solid transparent; color: var(--text-muted); font-family: inherit; font-size: 11px; letter-spacing: 0.07em; text-transform: uppercase; padding: 10px 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: -1px; transition: color 0.15s, border-color 0.15s; }
        .wl-tab:hover { color: var(--text-secondary); }
        .wl-tab.active { color: var(--text-primary); border-bottom-color: var(--accent); }
        .wl-tab-badge { background: #dc2626; color: #fff; font-size: 9px; font-weight: 700; letter-spacing: 0; border-radius: 99px; min-width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center; padding: 0 4px; }

        .wl-add-row { display: flex; align-items: center; gap: 6px; padding: 10px 12px; border-bottom: 1px solid var(--border); }
        .wl-add-input { flex: 1; background: transparent; border: none; outline: none; color: var(--text-primary); font-family: inherit; font-size: 13px; }
        .wl-add-input::placeholder { color: var(--text-muted); }
        .wl-add-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; padding: 2px; transition: color 0.15s; }
        .wl-add-btn:hover { color: var(--text-primary); }

        .wl-list { overflow-y: auto; max-height: 380px; padding: 6px 0; }
        .wl-empty { font-size: 12px; color: var(--text-muted); padding: 16px 14px; margin: 0; }

        .wl-item { display: flex; align-items: center; gap: 10px; padding: 8px 14px; transition: background 0.1s; }
        .wl-item:hover { background: #ffffff04; }
        .wl-item:hover .wl-del { opacity: 1; }
        .wl-item-done { opacity: 0.45; }

        .wl-check { width: 20px; height: 20px; min-width: 20px; border-radius: 50%; border: 1.5px solid #555; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: border-color 0.15s, background 0.15s, transform 0.1s; flex-shrink: 0; }
        .wl-check:hover { border-color: #22c55e; background: #22c55e18; transform: scale(1.1); }
        .wl-check-done { background: #22c55e; border-color: #22c55e; }
        .wl-check-done:hover { background: #16a34a; border-color: #16a34a; }

        .wl-title { font-size: 13px; color: var(--text-primary); line-height: 1.3; }
        .wl-title-done { text-decoration: line-through; color: var(--text-muted); }

        .wl-edit-input { flex: 1; background: transparent; border: none; border-bottom: 1px solid var(--border-hover); outline: none; color: var(--text-primary); font-family: inherit; font-size: 13px; padding: 0 0 1px; min-width: 0; }

        .wl-del { background: none; border: none; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; padding: 2px; opacity: 0; transition: color 0.15s, opacity 0.15s; flex-shrink: 0; }
        .wl-del:hover { color: #f87171; }
      `}</style>
    </>
  );
}
