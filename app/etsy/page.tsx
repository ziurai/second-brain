import Nav from "../components/Nav";
import EtsySales from "../components/EtsySales";
import PageHeader from "../components/PageHeader";

export default function EtsyPage() {
  return (
    <main className="main">
      <PageHeader title="Etsy Sales" />
      <Nav />
      <EtsySales />
      <style>{`
        .main {
          min-height: 100vh;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 32px;
        }
        @media (max-width: 640px) {
          .main { padding: 0 16px !important; }
        }
      `}</style>
    </main>
  );
}
