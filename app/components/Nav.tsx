"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "Brain", href: "/" },
  { label: "Print", href: "/print" },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <nav className="top-nav">
      {TABS.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={`top-nav-link ${pathname === t.href ? "active" : ""}`}
        >
          {t.label}
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
        }
        .top-nav-link:hover { color: var(--text-secondary); }
        .top-nav-link.active {
          color: var(--text-primary);
          border-bottom-color: var(--text-primary);
        }
      `}</style>
    </nav>
  );
}
