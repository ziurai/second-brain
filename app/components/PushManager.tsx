"use client";
import { useEffect, useState } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Bell, BellOff, Send } from "lucide-react";

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const pad = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + pad).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export default function PushManager() {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const saveSubscription = useMutation(api.pushSubscriptions.save);
  const removeSubscription = useMutation(api.pushSubscriptions.remove);
  const sendTest = useAction(api.push.send);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    setSupported(true);

    navigator.serviceWorker.register("/sw.js").then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      setSubscribed(!!sub);
    });
  }, []);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const permission = await Notification.requestPermission();
      if (permission !== "granted") { setLoading(false); return; }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ) as unknown as BufferSource,
      });

      const json = sub.toJSON();
      await saveSubscription({
        endpoint: json.endpoint!,
        p256dh: json.keys!.p256dh,
        auth: json.keys!.auth,
      });
      setSubscribed(true);
    } catch (err) {
      console.error("Push subscribe failed:", err);
    }
    setLoading(false);
  };

  const handleUnsubscribe = async () => {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        await removeSubscription({ endpoint: sub.endpoint });
      }
      setSubscribed(false);
      setShowMenu(false);
    } catch (err) {
      console.error("Push unsubscribe failed:", err);
    }
    setLoading(false);
  };

  const handleTest = async () => {
    setShowMenu(false);
    await sendTest({
      title: "Second Brain",
      body: "Push notifications are working! 🎉",
      url: "/",
    });
  };

  if (!supported) return null;

  return (
    <>
      {showMenu && <div className="pm-backdrop" onClick={() => setShowMenu(false)} />}

      <div className="pm-wrap">
        <button
          className={`pm-btn${subscribed ? " pm-btn-on" : ""}`}
          onClick={() => {
            if (!subscribed) handleSubscribe();
            else setShowMenu((v) => !v);
          }}
          disabled={loading}
          title={subscribed ? "Notification settings" : "Enable push notifications"}
        >
          {subscribed ? <Bell size={13} /> : <BellOff size={13} />}
        </button>

        {showMenu && subscribed && (
          <div className="pm-menu">
            <button className="pm-menu-item" onClick={handleTest}>
              <Send size={11} /> Send test
            </button>
            <button className="pm-menu-item pm-menu-danger" onClick={handleUnsubscribe}>
              <BellOff size={11} /> Disable notifications
            </button>
          </div>
        )}
      </div>

      <style>{`
        .pm-wrap {
          position: fixed;
          bottom: 32px;
          right: 152px;
          z-index: 200;
        }
        .pm-backdrop {
          position: fixed;
          inset: 0;
          z-index: 199;
        }
        .pm-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #141414;
          border: 1px solid var(--border-hover);
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
          transition: all 0.15s;
        }
        .pm-btn:hover { color: var(--text-primary); background: #1c1c1c; transform: translateY(-1px); }
        .pm-btn:disabled { opacity: 0.5; cursor: wait; }
        .pm-btn-on { color: var(--accent) !important; border-color: var(--accent); }

        .pm-menu {
          position: absolute;
          bottom: 48px;
          right: 0;
          background: #141414;
          border: 1px solid var(--border-hover);
          border-radius: 8px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.6);
          overflow: hidden;
          min-width: 160px;
          z-index: 201;
          animation: pm-pop 0.14s ease;
        }
        @keyframes pm-pop {
          from { opacity: 0; transform: scale(0.95) translateY(4px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .pm-menu-item {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          background: none;
          border: none;
          color: var(--text-secondary);
          font-family: inherit;
          font-size: 11px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          padding: 10px 14px;
          cursor: pointer;
          transition: background 0.1s, color 0.1s;
          text-align: left;
        }
        .pm-menu-item:hover { background: #ffffff08; color: var(--text-primary); }
        .pm-menu-danger:hover { color: #f87171; }
      `}</style>
    </>
  );
}
