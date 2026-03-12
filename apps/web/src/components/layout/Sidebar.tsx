import { NavLink } from "react-router-dom";
import { useUiStore } from "../../stores/useUiStore";

const navItems = [
  { to: "/lobby", label: "로비", code: "LB" },
  { to: "/ranking", label: "랭킹", code: "RK" },
  { to: "/game", label: "출격", code: "GO" },
  { to: "/profile", label: "프로필", code: "PF" }
];

export const Sidebar = () => {
  const isLoggedIn = useUiStore((state) => state.isLoggedIn);

  return (
    <aside className="sidebar">
      <div className="brand-block">
        <p className="brand-block__eyebrow">KOR LIVE BUILD</p>
        <h1 className="brand-block__title">타워 디펜스</h1>
        <p className="brand-block__copy">
          3개 맵과 20웨이브 전장을 지원하는 한국어 브라우저 타워 디펜스 빌드입니다.
        </p>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            className={({ isActive }) =>
              isActive ? "sidebar-link sidebar-link--active" : "sidebar-link"
            }
            to={item.to}
          >
            <span className="sidebar-link__label">{item.label}</span>
            <span className="sidebar-link__meta">{item.code}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <strong>{isLoggedIn ? "실시간 연결 유지 중" : "로그인 대기 중"}</strong>
        <span>
          {isLoggedIn
            ? "작전 데이터와 최근 결과가 동기화되고 있습니다."
            : "로그인하면 최근 결과와 설정이 함께 저장됩니다."}
        </span>
      </div>
    </aside>
  );
};
