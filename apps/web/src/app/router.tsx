import { Suspense, lazy, type ReactNode } from "react";
import { createBrowserRouter, Navigate, Outlet, useLocation } from "react-router-dom";
import { LoginPage } from "../pages/auth/LoginPage";
import { SignupPage } from "../pages/auth/SignupPage";
import { AppLayout } from "./layouts/AppLayout";
import { LobbyPage } from "../pages/lobby/LobbyPage";
import { ProfilePage } from "../pages/profile/ProfilePage";
import { RankingPage } from "../pages/ranking/RankingPage";
import { useUiStore } from "../stores/useUiStore";

const GamePage = lazy(async () => {
  const module = await import("../pages/game/GamePage");
  return { default: module.GamePage };
});

const HomeRedirect = () => {
  const isLoggedIn = useUiStore((state) => state.isLoggedIn);
  return <Navigate replace to={isLoggedIn ? "/lobby" : "/login"} />;
};

const ProtectedOutlet = ({ children }: { children?: ReactNode }) => {
  const isLoggedIn = useUiStore((state) => state.isLoggedIn);
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate replace state={{ from: location.pathname }} to="/login" />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeRedirect />
  },
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    path: "/signup",
    element: <SignupPage />
  },
  {
    path: "/notices",
    element: <Navigate replace to="/lobby" />
  },
  {
    path: "/notices/:noticeId",
    element: <Navigate replace to="/lobby" />
  },
  {
    path: "/shop",
    element: <Navigate replace to="/lobby" />
  },
  {
    path: "/payment/checkout",
    element: <Navigate replace to="/lobby" />
  },
  {
    path: "/payment/result",
    element: <Navigate replace to="/lobby" />
  },
  {
    element: <AppLayout />,
    children: [
      {
        path: "/lobby",
        element: (
          <ProtectedOutlet>
            <LobbyPage />
          </ProtectedOutlet>
        )
      },
      {
        path: "/ranking",
        element: <RankingPage />
      },
      {
        element: <ProtectedOutlet />,
        children: [
          {
            path: "/profile",
            element: <ProfilePage />
          },
          {
            path: "/game",
            element: (
              <Suspense fallback={<div className="stack-card">전장을 불러오는 중입니다.</div>}>
                <GamePage />
              </Suspense>
            )
          }
        ]
      }
    ]
  }
]);
