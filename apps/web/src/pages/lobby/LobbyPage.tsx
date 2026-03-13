import { Link } from "react-router-dom";
import { StatCard } from "../../components/ui/StatCard";
import { useUiStore } from "../../stores/useUiStore";

export const LobbyPage = () => {
  const nickname = useUiStore((state) => state.nickname);
  const lastResult = useUiStore((state) => state.lastResult);

  return (
    <section className="page-grid">
      <div className="hero-card">
        <p className="panel-tag">COMMAND LOBBY</p>
        <h1>{nickname} 지휘관님, 오늘의 전장을 선택하세요.</h1>
        <p>
          3개 맵과 50웨이브 구성이 모두 준비되어 있습니다. 랭킹을 확인하거나 바로 출격해 최근
          결과를 기준으로 운영을 이어갈 수 있습니다.
        </p>
        <div className="hero-card__actions">
          <Link className="button button--primary" to="/game">
            전장으로 이동
          </Link>
          <Link className="button button--ghost" to="/ranking">
            랭킹 확인
          </Link>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard accent="teal" label="전장 구성" value="3개 맵">
          고정 경로 전장과 총 27개 배치 슬롯 준비
        </StatCard>
        <StatCard accent="amber" label="웨이브" value="50">
          포대 3종, 업그레이드 5단계, 5웨이브마다 보스 등장
        </StatCard>
        <StatCard
          accent="coral"
          label="최근 결과"
          value={lastResult ? lastResult.summary : "기록 없음"}
        >
          {lastResult
            ? `점수 ${lastResult.score} / 최고 웨이브 ${lastResult.bestWave}`
            : "아직 출격 기록이 없습니다."}
        </StatCard>
      </div>

      <div className="stack-grid">
        <article className="stack-card">
          <div className="stack-card__row">
            <h3>전술 운영 팁</h3>
            <span className="pill">MVP GUIDE</span>
          </div>
          <ul className="plain-list">
            <li>기관 포대는 초반 라인 정리와 기동병 대응에 가장 안정적입니다.</li>
            <li>중화기 포대는 중장갑과 보스 처리 비중이 커서 5웨이브 단위에서 강해집니다.</li>
            <li>빙결 포대는 코너와 교차 구간에 놓으면 전체 라인 유지력이 크게 올라갑니다.</li>
          </ul>
        </article>

        <article className="stack-card">
          <div className="stack-card__row">
            <h3>전장 구성</h3>
            <span className="pill">CORE SET</span>
          </div>
          <ul className="plain-list">
            <li>모든 맵은 같은 포대 세트를 공유하지만 경로와 슬롯 배치가 달라 운영법이 달라집니다.</li>
            <li>모든 맵에서 50웨이브와 5단 업그레이드, 레벨 5 특수 효과를 사용할 수 있습니다.</li>
            <li>5, 10, 15웨이브처럼 5단위 웨이브마다 보스가 등장합니다.</li>
          </ul>
        </article>
      </div>
    </section>
  );
};
