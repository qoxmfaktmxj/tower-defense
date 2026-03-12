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
          3개 맵과 20웨이브 구성이 모두 준비되어 있습니다. 랭킹을 확인한 뒤 바로 출격할 수 있고,
          최근 결과도 여기에서 바로 이어서 볼 수 있습니다.
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
          고정 경로 기반 전장과 총 27개 슬롯 프리셋
        </StatCard>
        <StatCard accent="amber" label="웨이브" value="20">
          타워 3종, 업그레이드 5단계, 레벨 5 오버드라이브
        </StatCard>
        <StatCard accent="coral" label="최근 결과" value={lastResult ? lastResult.summary : "기록 없음"}>
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
            <li>기관포 타워는 초반 라인 정리와 기동병 대응에 가장 안정적입니다.</li>
            <li>중화기 타워는 중장갑과 보스를 묶어 맞출 때 효율이 크게 올라갑니다.</li>
            <li>빙결 타워는 긴 직선과 코너 진입 구간에서 적 흐름을 끊어내는 데 강합니다.</li>
          </ul>
        </article>
        <article className="stack-card">
          <div className="stack-card__row">
            <h3>전장 구성</h3>
            <span className="pill">CORE SET</span>
          </div>
          <ul className="plain-list">
            <li>기본 전장 테마 하나에 집중해 가독성과 전투 정보를 더 안정적으로 다듬었습니다.</li>
            <li>세 개 맵은 모두 같은 타워 규칙을 공유하되 경로와 슬롯 배치가 서로 다르게 설계되어 있습니다.</li>
            <li>모든 맵에서 20웨이브, 타워 5단 업그레이드, 레벨 5 오버드라이브를 동일하게 사용할 수 있습니다.</li>
          </ul>
        </article>
      </div>
    </section>
  );
};
