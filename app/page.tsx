import Clock from "./components/Clock";
import WeatherGreeting from "./components/WeatherGreeting";
import Dashboard from "./components/Dashboard";

export default function Home() {
  return (
    <main className="main">
      <header className="header">
        <div className="greeting-block">
          <div className="greeting-left">
            <h1 className="greeting">Hello, Alex.</h1>
            <WeatherGreeting />
          </div>
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

        .greeting-left {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .greeting {
          font-size: clamp(28px, 5vw, 48px);
          font-weight: 300;
          letter-spacing: -0.03em;
          color: var(--text-primary);
        }

        .weather-greeting {
          font-size: 18px;
          color: var(--text-primary);
          font-weight: 300;
          letter-spacing: -0.01em;
          opacity: 0.92;
        }

        .clock-block {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 2px;
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
