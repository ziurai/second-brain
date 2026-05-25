"use client";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Plus, X } from "lucide-react";
import { burst } from "../lib/confetti";

type WLType = "movie" | "tv";

interface WatchlistItem {
  _id: Id<"watchlist">;
  type: WLType;
  title: string;
  releaseDate?: string;
  platform?: string;
  watched: boolean;
  order: number;
}

// Module-level to prevent focus loss on re-renders
function WLItemRow({ item, onToggle, onSave, onRemove }: {
  item: WatchlistItem;
  onToggle: (el: HTMLElement) => void;
  onSave: (title: string, releaseDate?: string, platform?: string) => void;
  onRemove: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);
  const [editDate, setEditDate] = useState(item.releaseDate ?? "");
  const [editPlatform, setEditPlatform] = useState(item.platform ?? "");

  const startEdit = () => {
    setEditTitle(item.title);
    setEditDate(item.releaseDate ?? "");
    setEditPlatform(item.platform ?? "");
    setEditing(true);
  };

  const save = () => {
    if (editTitle.trim()) {
      onSave(editTitle.trim(), editDate.trim() || undefined, editPlatform.trim() || undefined);
    }
    setEditing(false);
  };

  return (
    <div className={`wl-item${item.watched ? " wl-item-done" : ""}`}>
      <button
        className={`wl-check${item.watched ? " wl-check-done" : ""}`}
        onClick={(e) => onToggle(e.currentTarget)}
      >
        {item.watched && (
          <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
            <path d="M1 4L4 7.5L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      {editing ? (
        <div className="wl-edit-fields">
          <input
            className="wl-edit-input"
            value={editTitle}
            autoFocus
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
          />
          <input
            className="wl-edit-input wl-edit-sm"
            placeholder="Year / date"
            value={editDate}
            onChange={(e) => setEditDate(e.target.value)}
          />
          <input
            className="wl-edit-input wl-edit-sm"
            placeholder="Platform"
            value={editPlatform}
            onChange={(e) => setEditPlatform(e.target.value)}
            onBlur={save}
          />
        </div>
      ) : (
        <div className="wl-item-info" onDoubleClick={!item.watched ? startEdit : undefined}>
          <span className={`wl-title${item.watched ? " wl-title-done" : ""}`}>{item.title}</span>
          <div className="wl-pills">
            {item.releaseDate && <span className="wl-pill">{item.releaseDate}</span>}
            {item.platform && <span className="wl-pill">{item.platform}</span>}
          </div>
        </div>
      )}
      <button className="wl-del" onClick={onRemove}><X size={10} /></button>
    </div>
  );
}

export default function WatchlistModal({ type, onClose }: { type: WLType; onClose: () => void }) {
  const allItems = (useQuery(api.watchlist.list) ?? []) as WatchlistItem[];
  const items = allItems.filter((i) => i.type === type);

  const addItem = useMutation(api.watchlist.add);
  const toggleItem = useMutation(api.watchlist.toggle);
  const updateItem = useMutation(api.watchlist.update);
  const removeItem = useMutation(api.watchlist.remove);

  const [tab, setTab] = useState<"unwatched" | "watched">("unwatched");
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newPlatform, setNewPlatform] = useState("");

  const unwatched = items.filter((i) => !i.watched).sort((a, b) => a.order - b.order);
  const watched = items.filter((i) => i.watched).sort((a, b) => a.order - b.order);
  const displayed = tab === "unwatched" ? unwatched : watched;

  const handleAdd = async () => {
    const txt = newTitle.trim();
    if (!txt) return;
    await addItem({
      type,
      title: txt,
      releaseDate: newDate.trim() || undefined,
      platform: newPlatform.trim() || undefined,
      watched: false,
      order: items.length,
    });
    setNewTitle("");
    setNewDate("");
    setNewPlatform("");
  };

  const handleToggle = async (item: WatchlistItem, el: HTMLElement) => {
    if (!item.watched) burst(el);
    await toggleItem({ id: item._id, watched: !item.watched });
  };

  const label = type === "movie" ? "Movies" : "TV Shows";
  const icon = type === "movie" ? "🎬" : "📺";

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal wl-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <span>{icon} {label}</span>
            <button onClick={onClose}><X size={16} /></button>
          </div>

          <div className="wl-tabs">
            <button
              className={`wl-tab${tab === "unwatched" ? " active" : ""}`}
              onClick={() => setTab("unwatched")}
            >
              Unwatched
            </button>
            <button
              className={`wl-tab${tab === "watched" ? " active" : ""}`}
              onClick={() => setTab("watched")}
            >
              Watched
            </button>
          </div>

          {tab === "unwatched" && (
            <div className="wl-add-row">
              <div className="wl-add-main">
                <input
                  className="wl-add-input"
                  placeholder={`Add ${type === "movie" ? "movie" : "show"}...`}
                  value={newTitle}
                  autoFocus
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
                />
                <button className="wl-add-btn" onClick={handleAdd}><Plus size={14} /></button>
              </div>
              <div className="wl-add-sub">
                <input
                  className="wl-add-input wl-add-sub-input"
                  placeholder="Year / date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
                />
                <input
                  className="wl-add-input wl-add-sub-input"
                  placeholder="Platform"
                  value={newPlatform}
                  onChange={(e) => setNewPlatform(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
                />
              </div>
            </div>
          )}

          <div className="wl-list">
            {displayed.length === 0 && (
              <p className="wl-empty">
                {tab === "unwatched" ? `Nothing on your ${type === "movie" ? "movie" : "show"} list yet.` : "Nothing watched yet."}
              </p>
            )}
            {displayed.map((item) => (
              <WLItemRow
                key={item._id}
                item={item}
                onToggle={(el) => handleToggle(item, el)}
                onSave={(title, releaseDate, platform) =>
                  updateItem({ id: item._id, title, releaseDate, platform })
                }
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

        .wl-add-row { display: flex; flex-direction: column; gap: 6px; padding: 10px 12px; border-bottom: 1px solid var(--border); }
        .wl-add-main { display: flex; align-items: center; gap: 6px; }
        .wl-add-sub { display: flex; gap: 12px; }
        .wl-add-input { flex: 1; background: transparent; border: none; outline: none; color: var(--text-primary); font-family: inherit; font-size: 13px; min-width: 0; }
        .wl-add-input::placeholder { color: var(--text-muted); }
        .wl-add-sub-input { font-size: 11px; color: var(--text-secondary); }
        .wl-add-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; padding: 2px; flex-shrink: 0; transition: color 0.15s; }
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

        .wl-item-info { flex: 1; display: flex; flex-direction: column; gap: 3px; cursor: default; user-select: none; min-width: 0; }
        .wl-title { font-size: 13px; color: var(--text-primary); line-height: 1.3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .wl-title-done { text-decoration: line-through; color: var(--text-muted); }
        .wl-pills { display: flex; gap: 4px; flex-wrap: wrap; }
        .wl-pill { font-size: 9px; color: var(--text-muted); letter-spacing: 0.06em; background: #ffffff06; border: 1px solid var(--border); border-radius: 2px; padding: 1px 5px; text-transform: uppercase; }

        .wl-edit-fields { flex: 1; display: flex; gap: 6px; align-items: center; min-width: 0; }
        .wl-edit-input { flex: 1; background: transparent; border: none; border-bottom: 1px solid var(--border-hover); outline: none; color: var(--text-primary); font-family: inherit; font-size: 13px; padding: 0 0 1px; min-width: 0; }
        .wl-edit-sm { flex: 0 0 80px; font-size: 11px; }

        .wl-del { background: none; border: none; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; padding: 2px; opacity: 0; transition: color 0.15s, opacity 0.15s; flex-shrink: 0; }
        .wl-del:hover { color: #f87171; }
      `}</style>
    </>
  );
}
