import { useQuery } from "@tanstack/react-query";
import { getRankings } from "../../lib/api/client";
import { queryKeys } from "../../lib/query/keys";
import { formatDateTime, formatNumber } from "../../lib/utils/format";

export const RankingPage = () => {
  const rankingsQuery = useQuery({
    queryKey: queryKeys.rankings.all,
    queryFn: getRankings
  });

  const rankings = rankingsQuery.data ?? [];
  const bestEntry = rankings[0];

  return (
    <section className="page-grid">
      <div className="page-header">
        <div>
          <p className="panel-tag">RANKING BOARD</p>
          <h1>전장 랭킹</h1>
          <p className="page-header__copy">
            제출된 기록은 검증을 거쳐 순위표에 반영됩니다. 동일 점수에서는 더 빠른 기록이 우선합니다.
          </p>
        </div>
        <div className="status-list status-list--stacked">
          <span>현재 등록 기록 {formatNumber(rankings.length)}건</span>
          <span>최고 점수 {bestEntry ? formatNumber(bestEntry.score) : "-"}</span>
        </div>
      </div>

      <div className="stats-grid">
        <article className="stack-card stack-card--compact">
          <p className="panel-tag">TOP COMMANDER</p>
          <h3>{bestEntry ? bestEntry.nickname : "대기 중"}</h3>
          <p>{bestEntry ? `${formatNumber(bestEntry.score)}점 / 웨이브 ${bestEntry.bestWave}` : "기록 없음"}</p>
        </article>
        <article className="stack-card stack-card--compact">
          <p className="panel-tag">UPDATE</p>
          <h3>{rankingsQuery.isFetching ? "동기화 중" : "반영 완료"}</h3>
          <p>순위표는 포커스 복귀 시 강제 갱신하지 않고 캐시를 기준으로 유지됩니다.</p>
        </article>
      </div>

      <div className="table-card">
        {rankingsQuery.isLoading ? (
          <div className="table-card__empty">랭킹 데이터를 불러오는 중입니다.</div>
        ) : rankings.length === 0 ? (
          <div className="table-card__empty">아직 등록된 전투 기록이 없습니다.</div>
        ) : (
          <table className="ranking-table">
            <thead>
              <tr>
                <th>순위</th>
                <th>지휘관</th>
                <th>점수</th>
                <th>최고 웨이브</th>
                <th>기록 시각</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.rank}</td>
                  <td>{entry.nickname}</td>
                  <td>{formatNumber(entry.score)}</td>
                  <td>{entry.bestWave}</td>
                  <td>{formatDateTime(entry.playedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};
