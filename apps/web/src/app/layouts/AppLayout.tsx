import { Outlet } from "react-router-dom";
import { Header } from "../../components/layout/Header";
import { Sidebar } from "../../components/layout/Sidebar";

export const AppLayout = () => {
  return (
    <div className="shell">
      <Sidebar />
      <div className="shell__content">
        <Header />
        <main className="shell__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
