import Nav from "../components/Nav";
import CalendarView from "../components/CalendarView";
import PageHeader from "../components/PageHeader";

export default function CalendarPage() {
  return (
    <main className="main">
      <PageHeader title="Calendar" />
      <Nav />
      <CalendarView />
      <style>{`
        .main {
          min-height: 100vh;
          max-width: 1100px;
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
