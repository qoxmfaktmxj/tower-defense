import { stageCatalog } from "@tower-defense/game";
import { Link, useNavigate } from "react-router-dom";
import { StageRoutePreview } from "../../components/ui/StageRoutePreview";
import { StatCard } from "../../components/ui/StatCard";
import { useUiStore } from "../../stores/useUiStore";

export const LobbyPage = () => {
  const navigate = useNavigate();
  const { nickname, lastResult, selectedStageId, setSelectedStageId } = useUiStore();

  return (
    <section className="page-grid">
      <article className="hero-card hero-card--command">
        <div>
          <p className="panel-tag">OPERATION LOBBY</p>
          <h1>{nickname} 지휘관, 다음 방어선을 선택하십시오.</h1>
          <p>
            현재 빌드는 세 개의 전장과 오십 개 웨이브를 지원합니다. 전장별 구조는 다르지만 포대
            체계와 결과 제출 흐름은 동일하게 유지됩니다.
          </p>
        </div>
        <div className="hero-card__actions">
          <Link className="button button--primary" to="/game">
            즉시 출격
          </Link>
          <Link className="button button--ghost" to="/ranking">
            랭킹 열람
          </Link>
        </div>
      </article>

      <div className="stats-grid">
        <StatCard accent="teal" label="전장" value="3개 섹터">
          경로와 슬롯 구성만 다르고 포대 체계는 동일합니다.
        </StatCard>
        <StatCard accent="amber" label="웨이브" value="50">
          5웨이브마다 보스가 등장합니다.
        </StatCard>
        <StatCard accent="coral" label="최근 결과" value={lastResult ? lastResult.summary : "기록 없음"}>
          {lastResult
            ? `점수 ${lastResult.score.toLocaleString()} / 최고 웨이브 ${lastResult.bestWave}`
            : "아직 제출된 전투 기록이 없습니다."}
        </StatCard>
      </div>

      <section className="mission-grid">
        {stageCatalog.map((stage) => {
          const isActive = stage.id === selectedStageId;

          return (
            <button
              className={isActive ? "mission-card mission-card--active" : "mission-card"}
              key={stage.id}
              onClick={() => {
                setSelectedStageId(stage.id);
                navigate("/game");
              }}
              type="button"
            >
              <StageRoutePreview stageId={stage.id} />
              <div className="mission-card__body">
                <div className="mission-card__header">
                  <div>
                    <p className="mission-card__eyebrow">{stage.sector}</p>
                    <h3>{stage.name}</h3>
                  </div>
                  <span className="pill">{stage.threatLevel}</span>
                </div>
                <p>{stage.tacticalNote}</p>
                <div className="status-list">
                  <span>추천 포대 {stage.recommendedTowerLabel}</span>
                  <span>{isActive ? "현재 선택됨" : "선택 후 즉시 출격"}</span>
                </div>
              </div>
            </button>
          );
        })}
      </section>

      <div className="stack-grid stack-grid--duo">
        <article className="stack-card">
          <div className="stack-card__row">
            <h3>운용 메모</h3>
            <span className="pill">FIELD NOTES</span>
          </div>
          <ul className="plain-list">
            <li>기관 포대는 초반 라인을 빠르게 정리하는 기본 축입니다.</li>
            <li>중화기 포대는 보스 웨이브 직전 교차 구간에 배치하는 편이 효율적입니다.</li>
            <li>빙결 포대는 긴 코너와 합류 구간에 배치하면 전체 화력 체감이 크게 올라갑니다.</li>
          </ul>
        </article>

        <article className="stack-card">
          <div className="stack-card__row">
            <h3>현재 빌드 범위</h3>
            <span className="pill">BUILD SCOPE</span>
          </div>
          <ul className="plain-list">
            <li>전장 전환, 전체 화면, 단축키, 결과 제출, 랭킹, 세션 저장이 모두 활성화되어 있습니다.</li>
            <li>맵은 세 개지만 포대 세트는 공통입니다. 밸런스 조정은 웨이브 데이터에서 진행합니다.</li>
            <li>게임 화면은 전술 HUD, 하단 액션 바, 우측 인스펙터 구조로 다시 정리되어 있습니다.</li>
          </ul>
        </article>
      </div>
    </section>
  );
};
