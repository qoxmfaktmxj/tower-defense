import { Link, useNavigate } from "react-router-dom";
import { useUiStore } from "../../stores/useUiStore";

interface HeaderProps {
  compact?: boolean;
}

export const Header = ({ compact = false }: HeaderProps) => {
  const navigate = useNavigate();
  const { isLoggedIn, nickname, volume, setVolume, logOut } = useUiStore();

  return (
    <header className={compact ? "topbar topbar--compact" : "topbar"}>
      <div className="topbar__intro">
        <p className="topbar__eyebrow">{compact ? "TACTICAL CONSOLE" : "TACTICAL COMMAND"}</p>
        <h2 className="topbar__title">{compact ? "전장 링크" : "타워 디펜스"}</h2>
        {!compact ? (
          <p className="topbar__status">
            {isLoggedIn
              ? "세션 동기화와 전장 기록 전송이 활성화되었습니다."
              : "로그인 전 상태입니다. 전장 진입 시 세션 연결이 필요합니다."}
          </p>
        ) : null}
      </div>

      <div className="topbar__actions">
        <label className="volume-control">
          <span>전장 음향</span>
          <input
            max={1}
            min={0}
            onChange={(event) => setVolume(Number(event.target.value))}
            step={0.05}
            type="range"
            value={volume}
          />
          <strong>{Math.round(volume * 100)}%</strong>
        </label>

        {isLoggedIn ? (
          <>
            <div className="profile-chip">
              <strong>{nickname}</strong>
              <small>{compact ? "전장 세션 유지 중" : "지휘 세션 활성"}</small>
            </div>
            <button
              className="button button--ghost"
              onClick={() => {
                logOut();
                navigate("/login");
              }}
              type="button"
            >
              로그아웃
            </button>
          </>
        ) : (
          <Link className="button button--ghost" to="/login">
            로그인
          </Link>
        )}
      </div>
    </header>
  );
};
