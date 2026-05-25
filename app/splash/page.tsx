"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import brainSrc from "../../public/brain.png";

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
        <Image
          className="brain"
          src={brainSrc}
          alt="Brain"
          width={200}
          height={200}
          priority
          onClick={() => setOpen(true)}
          style={{ cursor: "pointer" }}
        />

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
          width: 200px;
          height: 200px;
          object-fit: contain;
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
