"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Splash() {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Meta") setOpen(true);
      if (e.key === "Escape") { setOpen(false); setPassword(""); setError(""); }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
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

  return (
    <div className="splash">
      <div className="splash-content">
        {/* Brain icon — placeholder until real asset is dropped in */}
        <svg
          className="brain"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
          <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
        </svg>

        {open && (
          <form className="login-form" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              className="login-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            {error && <p className="login-error">{error}</p>}
            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? "…" : "Enter"}
            </button>
          </form>
        )}
      </div>

      <style>{`
        .splash {
          position: fixed;
          inset: 0;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .splash-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 48px;
        }
        .brain {
          width: 72px;
          height: 72px;
          opacity: 0.9;
        }
        .login-form {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          width: 240px;
        }
        .login-input {
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(255,255,255,0.35);
          color: #fff;
          font-size: 18px;
          font-weight: 300;
          letter-spacing: 0.08em;
          text-align: center;
          padding: 8px 0;
          width: 100%;
          outline: none;
        }
        .login-input::placeholder {
          color: rgba(255,255,255,0.25);
          letter-spacing: 0.05em;
        }
        .login-error {
          color: rgba(255,90,90,0.8);
          font-size: 12px;
          margin: 0;
        }
        .login-btn {
          background: none;
          border: 1px solid rgba(255,255,255,0.2);
          color: rgba(255,255,255,0.6);
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          padding: 7px 28px;
          cursor: pointer;
          transition: border-color 0.15s, color 0.15s;
        }
        .login-btn:hover {
          border-color: rgba(255,255,255,0.55);
          color: #fff;
        }
      `}</style>
    </div>
  );
}
