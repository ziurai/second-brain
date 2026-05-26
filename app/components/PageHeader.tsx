import Clock from "./Clock";
import WeatherGreeting from "./WeatherGreeting";

export default function PageHeader({ title }: { title: string }) {
  return (
    <header className="header">
      <div className="greeting-block">
        <div className="greeting-left">
          <h1 className="greeting">{title}</h1>
          <WeatherGreeting />
        </div>
        <Clock />
      </div>
      <div className="header-rule" />
      <style>{`
        .header {
          padding-top: 56px;
          padding-bottom: 40px;
        }
        .greeting-block {
          display: flex;
          align-items: flex-start;
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
          margin: 0;
        }
        .weather-greeting {
          font-size: 18px;
          color: var(--text-primary);
          font-weight: 300;
          letter-spacing: -0.01em;
          opacity: 0.92;
          margin: 0;
        }
        .clock-block {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 2px;
          padding-top: 6px;
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
        @media (max-width: 640px) {
          .header { padding-top: 32px !important; padding-bottom: 24px !important; }
          .weather-greeting { font-size: 14px; }
        }
      `}</style>
    </header>
  );
}
