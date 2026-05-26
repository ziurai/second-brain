"use client";
import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <button
        className={`scroll-top-btn ${visible ? "scroll-top-visible" : ""}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Scroll to top"
      >
        <ArrowUp size={16} />
      </button>
      <style>{`
        .scroll-top-btn {
          position: fixed;
          bottom: 32px;
          right: 32px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #ffffff0f;
          border: 1px solid var(--border);
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          pointer-events: none;
          transform: translateY(8px);
          transition: opacity 0.2s, transform 0.2s, border-color 0.15s, color 0.15s;
          z-index: 50;
        }
        .scroll-top-btn:hover {
          border-color: var(--border-hover);
          color: var(--text-primary);
          background: #ffffff18;
        }
        .scroll-top-visible {
          opacity: 1;
          pointer-events: auto;
          transform: translateY(0);
        }
        @media (max-width: 640px) {
          .scroll-top-btn { bottom: 20px; right: 20px; }
        }
      `}</style>
    </>
  );
}
