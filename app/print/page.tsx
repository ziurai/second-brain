import Nav from "../components/Nav";
import PrintSchedule from "../components/PrintSchedule";
import PageHeader from "../components/PageHeader";

export default function PrintPage() {
  return (
    <main className="main">
      <PageHeader title="3D Print Schedule" />
      <Nav />
      <PrintSchedule />
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
