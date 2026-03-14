import { useQuery } from "@tanstack/react-query";
import { getSession } from "../../lib/api/client";
import { queryKeys } from "../../lib/query/keys";
import { formatNumber } from "../../lib/utils/format";
import { useUiStore } from "../../stores/useUiStore";

export const ProfilePage = () => {
  const { volume, lastResult, selectedStageId } = useUiStore();
  const sessionQuery = useQuery({
    queryKey: queryKeys.auth.session,
    queryFn: getSession
  });

  if (sessionQuery.isLoading) {
    return <div className="stack-card">프로필 데이터를 동기화하는 중입니다.</div>;
  }

  if (!sessionQuery.data) {
    return <div className="stack-card">프로필 데이터를 불러오지 못했습니다.</div>;
  }

  const session = sessionQuery.data;

  return (
    <section className="page-grid">
      <div className="page-header">
        <div>
          <p className="panel-tag">COMMAND PROFILE</p>
          <h1>{session.nickname}</h1>
          <p className="page-header__copy">{session.email}</p>
        </div>
        <div className="status-list status-list--stacked">
          <span>저장된 전장 {selectedStageId}</span>
          <span>효과음 {Math.round(volume * 100)}%</span>
        </div>
      </div>

      <div className="stats-grid">
        <article className="stack-card stack-card--compact">
          <p className="panel-tag">RESOURCE</p>
          <h3>골드 {formatNumber(session.gold)}</h3>
          <p>포대 연구와 경제 흐름 테스트에 사용하는 기본 자원입니다.</p>
        </article>
        <article className="stack-card stack-card--compact">
          <p className="panel-tag">PREMIUM</p>
          <h3>보석 {formatNumber(session.gems)}</h3>
          <p>현재 빌드에서는 표시만 유지되며 실제 소비는 연결하지 않았습니다.</p>
        </article>
        <article className="stack-card stack-card--compact">
          <p className="panel-tag">LAST RUN</p>
          <h3>{lastResult ? `${lastResult.bestWave}웨이브` : "기록 없음"}</h3>
          <p>{lastResult ? lastResult.summary : "아직 저장된 전투 기록이 없습니다."}</p>
        </article>
      </div>

      <div className="stack-grid stack-grid--duo">
        <article className="stack-card">
          <div className="stack-card__row">
            <h3>세션 상태</h3>
            <span className="pill">ACTIVE</span>
          </div>
          <ul className="plain-list">
            <li>닉네임과 로그인 상태, 볼륨, 마지막 결과는 브라우저 스토리지에 유지됩니다.</li>
            <li>랭킹 제출은 서버 검증 결과에 따라 즉시 반영되거나 검증 대기로 남을 수 있습니다.</li>
            <li>현재 전장 선택 값은 다음 출격 시 기본값으로 이어집니다.</li>
          </ul>
        </article>

        <article className="stack-card">
          <div className="stack-card__row">
            <h3>운영 메모</h3>
            <span className="pill">OPS</span>
          </div>
          <ul className="plain-list">
            <li>프로필 화면은 세션과 저장 상태를 확인하는 용도로 유지합니다.</li>
            <li>아이템 상점, 공지, 결제 흐름은 현재 스코프에서 제외되어 있습니다.</li>
            <li>실제 DB 연결 시 최근 전투 기록, 맵별 통계, 시즌 데이터를 이 화면에 확장할 수 있습니다.</li>
          </ul>
        </article>
      </div>
    </section>
  );
};
