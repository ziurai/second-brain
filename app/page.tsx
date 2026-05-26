import PageHeader from "./components/PageHeader";
import Dashboard from "./components/Dashboard";
import Nav from "./components/Nav";

export default function Home() {
  return (
    <main className="main">
      <PageHeader title="Hello, Alex." />
      <Nav />
      <section className="content">
        <Dashboard />
      </section>
      <style>{`
        .main {
          min-height: 100vh;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 32px;
        }
        .content { padding-top: 32px; }
        @media (max-width: 640px) {
          .main { padding: 0 16px !important; }
          .content { padding-top: 20px !important; }
        }
      `}</style>
    </main>
  );
}
