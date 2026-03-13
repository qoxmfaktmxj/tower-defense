import { Outlet, useLocation } from "react-router-dom";
import { Header } from "../../components/layout/Header";
import { Sidebar } from "../../components/layout/Sidebar";

export const AppLayout = () => {
  const location = useLocation();
  const isGameRoute = location.pathname.startsWith("/game");

  return (
    <div className="shell">
      <Sidebar />
      <div className={isGameRoute ? "shell__content shell__content--game" : "shell__content"}>
        <Header compact={isGameRoute} />
        <main className={isGameRoute ? "shell__main shell__main--game" : "shell__main"}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
