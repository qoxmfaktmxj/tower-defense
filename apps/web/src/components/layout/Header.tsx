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
      <div>
        <p className="topbar__eyebrow">{compact ? "TACTICAL LINK" : "전술 지원 대시보드"}</p>
        <h2 className="topbar__title">{compact ? "전장 콘솔" : "타워 디펜스 작전실"}</h2>
        {!compact ? (
          <p className="topbar__status">
            {isLoggedIn
              ? "작전 로비와 랭킹 서비스가 연결되어 있습니다."
              : "비로그인 모드로 화면을 둘러보는 중입니다."}
          </p>
        ) : null}
      </div>

      <div className="topbar__actions">
        <label className="volume-control">
          <span>작전 음향</span>
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
              <span>{nickname}</span>
              <small>{compact ? "전술 대기 중" : "실시간 동기화 상태"}</small>
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
