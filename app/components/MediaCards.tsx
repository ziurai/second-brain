"use client";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import WatchlistModal from "./WatchlistModal";
import ReadlistModal from "./ReadlistModal";

type ModalType = "movie" | "tv" | "book" | null;

export default function MediaCards() {
  const watchlist = useQuery(api.watchlist.list) ?? [];
  const readlist = useQuery(api.readlist.list) ?? [];
  const [open, setOpen] = useState<ModalType>(null);

  const movieCount = watchlist.filter((i) => i.type === "movie" && !i.watched).length;
  const tvCount = watchlist.filter((i) => i.type === "tv" && !i.watched).length;
  const bookCount = readlist.filter((i) => !i.read).length;

  return (
    <>
      <div className="media-cards">
        <button className="media-card" onClick={() => setOpen("movie")}>
          <span className="media-icon">🎬</span>
          <span className="media-label">Movies</span>
          {movieCount > 0 && <span className="media-badge">{movieCount}</span>}
        </button>
        <button className="media-card" onClick={() => setOpen("tv")}>
          <span className="media-icon">📺</span>
          <span className="media-label">TV Shows</span>
          {tvCount > 0 && <span className="media-badge">{tvCount}</span>}
        </button>
        <button className="media-card" onClick={() => setOpen("book")}>
          <span className="media-icon">📚</span>
          <span className="media-label">Books</span>
          {bookCount > 0 && <span className="media-badge">{bookCount}</span>}
        </button>
      </div>

      {(open === "movie" || open === "tv") && (
        <WatchlistModal type={open} onClose={() => setOpen(null)} />
      )}
      {open === "book" && (
        <ReadlistModal onClose={() => setOpen(null)} />
      )}

      <style>{`
        .media-cards {
          display: flex;
          gap: 10px;
          margin-bottom: 32px;
        }
        .media-card {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 10px 18px;
          cursor: pointer;
          font-family: inherit;
          color: var(--text-secondary);
          transition: all 0.15s;
          position: relative;
        }
        .media-card:hover {
          border-color: var(--border-hover);
          color: var(--text-primary);
          background: var(--bg-card-hover);
          transform: translateY(-1px);
        }
        .media-icon { font-size: 15px; line-height: 1; }
        .media-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.07em; }
        .media-badge {
          background: #dc2626;
          color: #fff;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0;
          border-radius: 99px;
          min-width: 16px;
          height: 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
        }
      `}</style>
    </>
  );
}
