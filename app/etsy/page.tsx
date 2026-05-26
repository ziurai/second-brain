import Nav from "../components/Nav";
import EtsySales from "../components/EtsySales";
import Clock from "../components/Clock";

export default function EtsyPage() {
  return (
    <main className="main">
      <header className="header">
        <div className="greeting-block">
          <h1 className="greeting">Etsy Sales</h1>
          <Clock />
        </div>
        <div className="header-rule" />
      </header>
      <Nav />
      <EtsySales />
      <style>{`
        .main {
          min-height: 100vh;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 32px;
        }
        .header { padding-top: 56px; padding-bottom: 40px; }
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
