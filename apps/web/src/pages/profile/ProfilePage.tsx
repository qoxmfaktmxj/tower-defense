import { useQuery } from "@tanstack/react-query";
import { getSession } from "../../lib/api/client";
import { queryKeys } from "../../lib/query/keys";
import { formatNumber } from "../../lib/utils/format";
import { useUiStore } from "../../stores/useUiStore";

export const ProfilePage = () => {
  const volume = useUiStore((state) => state.volume);
  const sessionQuery = useQuery({
    queryKey: queryKeys.auth.session,
    queryFn: getSession
  });

  if (!sessionQuery.data) {
    return <div className="stack-card">프로필 정보를 준비 중입니다.</div>;
  }

  const session = sessionQuery.data;

  return (
    <section className="card-grid">
      <article className="stack-card">
        <p className="panel-tag">PROFILE</p>
        <h2>{session.nickname}</h2>
        <p>{session.email}</p>
      </article>
      <article className="stack-card">
        <h3>보유 자원</h3>
        <p>골드 {formatNumber(session.gold)}</p>
        <p>보석 {formatNumber(session.gems)}</p>
      </article>
      <article className="stack-card">
        <h3>UI 설정</h3>
        <p>현재 효과음 볼륨: {Math.round(volume * 100)}%</p>
        <p>로그인 상태와 마지막 전투 결과는 브라우저에 저장됩니다.</p>
      </article>
    </section>
  );
};
