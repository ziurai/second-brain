"use client";
import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 100);
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
          position: fixed !important;
          bottom: 32px !important;
          right: 32px !important;
          width: 40px !important;
          height: 40px !important;
          border-radius: 50% !important;
          background-color: #1a1a1a !important;
          border: 1px solid #333 !important;
          color: #666 !important;
          cursor: pointer !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          opacity: 0;
          pointer-events: none;
          transform: translateY(8px);
          transition: opacity 0.2s, transform 0.2s, border-color 0.15s, color 0.15s, background-color 0.15s;
          z-index: 9999 !important;
        }
        .scroll-top-btn:hover {
          border-color: #444 !important;
          color: #f0f0f0 !important;
          background-color: #2a2a2a !important;
        }
        .scroll-top-visible {
          opacity: 1;
          pointer-events: auto;
          transform: translateY(0);
        }
        @media (max-width: 640px) {
          .scroll-top-btn { bottom: 20px !important; right: 20px !important; }
        }
      `}</style>
    </>
  );
}
