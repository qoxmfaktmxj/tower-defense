import { useQuery } from "@tanstack/react-query";
import { getRankings } from "../../lib/api/client";
import { queryKeys } from "../../lib/query/keys";
import { formatDateTime, formatNumber } from "../../lib/utils/format";

export const RankingPage = () => {
  const rankingsQuery = useQuery({
    queryKey: queryKeys.rankings.all,
    queryFn: getRankings
  });

  return (
    <section className="page-grid">
      <div className="page-header">
        <div>
          <p className="panel-tag">RANKING</p>
          <h1>전장 랭킹</h1>
        </div>
        <p className="page-header__copy">
          출격 종료 후 제출된 기록이 실시간 순위표에 반영됩니다.
        </p>
      </div>
      <div className="table-card">
        <table className="ranking-table">
          <thead>
            <tr>
              <th>순위</th>
              <th>지휘관</th>
              <th>점수</th>
              <th>최고 웨이브</th>
              <th>기록 시간</th>
            </tr>
          </thead>
          <tbody>
            {rankingsQuery.data?.map((entry) => (
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
      </div>
    </section>
  );
};
