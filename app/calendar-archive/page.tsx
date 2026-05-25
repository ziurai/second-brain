import CalendarArchive from "../components/CalendarArchive";

export default function CalendarArchivePage() {
  return (
    <main className="main">
      <header className="header">
        <div className="greeting-block">
          <div>
            <h1 className="greeting">Archive</h1>
            <p className="sub">Past events &amp; expired dates</p>
          </div>
          <a href="/calendar" className="back-link">← Calendar</a>
        </div>
        <div className="header-rule" />
      </header>
      <CalendarArchive />
      <style>{`
        .main {
          min-height: 100vh;
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 32px 80px;
        }
        .header { padding-top: 56px; padding-bottom: 40px; }
        .greeting-block {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;
        }
        .greeting {
          font-size: clamp(28px, 5vw, 48px);
          font-weight: 300;
          letter-spacing: -0.03em;
          color: var(--text-primary);
        }
        .sub {
          font-size: 13px;
          color: var(--text-muted);
          margin-top: 4px;
        }
        .back-link {
          font-size: 12px;
          color: var(--text-muted);
          text-decoration: none;
          transition: color 0.15s;
          padding-bottom: 4px;
        }
        .back-link:hover { color: var(--text-secondary); }
        .header-rule {
          width: 100%;
          height: 1px;
          background: var(--border);
          margin-top: 32px;
        }
      `}</style>
    </main>
  );
}
