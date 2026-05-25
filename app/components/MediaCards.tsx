"use client";
import { useState } from "react";
import WatchlistModal from "./WatchlistModal";
import ReadlistModal from "./ReadlistModal";

type ModalType = "movie" | "tv" | "book" | null;

export default function MediaCards() {
  const [open, setOpen] = useState<ModalType>(null);

  return (
    <>
      <div className="media-cards">
        <button className="media-card" onClick={() => setOpen("movie")}>
          <span className="media-icon">🎬</span>
          <span className="media-label">Movies</span>
        </button>
        <button className="media-card" onClick={() => setOpen("tv")}>
          <span className="media-icon">📺</span>
          <span className="media-label">TV Shows</span>
        </button>
        <button className="media-card" onClick={() => setOpen("book")}>
          <span className="media-icon">📚</span>
          <span className="media-label">Books</span>
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
      `}</style>
    </>
  );
}
