import Clock from "./components/Clock";
import Dashboard from "./components/Dashboard";

export default function Home() {
  return (
    <main className="main">
      <header className="header">
        <div className="greeting-block">
          <h1 className="greeting">Hello, Alex.</h1>
          <Clock />
        </div>
        <div className="header-rule" />
      </header>
      <section className="content">
        <Dashboard />
      </section>
      <style>{`
        .main {
          min-height: 100vh;
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 32px;
        }

        .header {
          padding-top: 56px;
          padding-bottom: 40px;
        }

        .greeting-block {
          display: flex;
          align-items: baseline;
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

        .clock-block {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 2px;
        }

        .clock-date {
          font-size: 11px;
          color: var(--text-secondary);
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .clock-time {
          font-size: 22px;
          font-weight: 300;
          color: var(--text-primary);
          letter-spacing: -0.02em;
          font-variant-numeric: tabular-nums;
        }

        .header-rule {
          width: 100%;
          height: 1px;
          background: var(--border);
          margin-top: 32px;
        }

        .content {
          padding-top: 32px;
        }
      `}</style>
    </main>
  );
}
