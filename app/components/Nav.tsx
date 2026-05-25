"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Nav() {
  const pathname = usePathname();
  const todayDate = new Date().toLocaleDateString("en-CA");
  const todayCount = useQuery(api.events.todayCount, { todayDate }) ?? 0;

  const TABS: { label: string; href: string; badge: number }[] = [
    { label: "Brain", href: "/", badge: 0 },
    { label: "Print", href: "/print", badge: 0 },
    { label: "Calendar", href: "/calendar", badge: todayCount },
  ];

  return (
    <nav className="top-nav">
      {TABS.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={`top-nav-link ${pathname === t.href ? "active" : ""}`}
        >
          {t.label}
          {t.badge > 0 && (
            <span className="nav-badge">{t.badge}</span>
          )}
        </Link>
      ))}
      <style>{`
        .top-nav {
          display: flex;
          gap: 24px;
          margin-bottom: 40px;
          border-bottom: 1px solid var(--border);
          padding-bottom: 0;
        }
        .top-nav-link {
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-muted);
          text-decoration: none;
          padding-bottom: 12px;
          border-bottom: 1px solid transparent;
          margin-bottom: -1px;
          transition: color 0.15s, border-color 0.15s;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .top-nav-link:hover { color: var(--text-secondary); }
        .top-nav-link.active {
          color: var(--text-primary);
          border-bottom-color: var(--text-primary);
        }
        .nav-badge {
          background: #dc2626;
          color: #fff;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0;
          border-radius: 99px;
          min-width: 16px;
          height: 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          line-height: 1;
        }
      `}</style>
    </nav>
  );
}
