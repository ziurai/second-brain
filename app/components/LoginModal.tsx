"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function LoginModal() {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Meta") {
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
        setPassword("");
        setError("");
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/");
    } else {
      setError("Incorrect password");
      setPassword("");
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <>
      <div className="modal-backdrop" onClick={() => { setOpen(false); setPassword(""); setError(""); }} />
      <div className="modal">
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            className="modal-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          {error && <p className="modal-error">{error}</p>}
          <button className="modal-btn" type="submit" disabled={loading}>
            {loading ? "…" : "Enter"}
          </button>
        </form>
      </div>
      <style>{`
        .modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 10;
        }
        .modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 20;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .modal-input {
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(255,255,255,0.4);
          color: #fff;
          font-size: 20px;
          font-weight: 300;
          letter-spacing: 0.1em;
          text-align: center;
          padding: 8px 0;
          width: 220px;
          outline: none;
        }
        .modal-input::placeholder {
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.05em;
        }
        .modal-error {
          color: rgba(255,100,100,0.8);
          font-size: 12px;
          text-align: center;
          margin: 0;
        }
        .modal-btn {
          background: none;
          border: 1px solid rgba(255,255,255,0.25);
          color: rgba(255,255,255,0.7);
          font-size: 12px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 6px 24px;
          cursor: pointer;
          margin-top: 4px;
        }
        .modal-btn:hover {
          border-color: rgba(255,255,255,0.6);
          color: #fff;
        }
      `}</style>
    </>
  );
}
