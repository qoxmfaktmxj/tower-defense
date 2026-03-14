import { useMutation } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { login } from "../../lib/api/client";
import { useUiStore } from "../../stores/useUiStore";

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const logIn = useUiStore((state) => state.logIn);
  const [email, setEmail] = useState("commander@towerdefense.kr");
  const [nickname, setNickname] = useState("지휘관 김");

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (session) => {
      logIn(session.nickname);
      navigate(location.state?.from ?? "/lobby");
    }
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    loginMutation.mutate({
      email,
      nickname
    });
  };

  return (
    <div className="auth-shell">
      <section className="auth-brief">
        <p className="panel-tag">TACTICAL ACCESS</p>
        <h1>전술 방어망 접속</h1>
        <p className="auth-copy">
          전장 선택, 실시간 랭킹, 전투 결과 제출까지 한 흐름으로 연결된 한국어 브라우저 타워
          디펜스 빌드입니다.
        </p>
        <div className="status-list status-list--stacked">
          <span>3개 전장 / 50웨이브 / 5단 포대 업그레이드</span>
          <span>전체 화면, 단축키, 세션 유지 지원</span>
        </div>
      </section>

      <section className="auth-panel">
        <p className="panel-tag">COMMAND LOGIN</p>
        <h1>지휘관 인증</h1>
        <p className="auth-copy">테스트 계정으로 바로 접속할 수 있습니다.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <span>이메일</span>
            <input
              onChange={(event) => setEmail(event.target.value)}
              placeholder="이메일 주소"
              type="email"
              value={email}
            />
          </label>
          <label>
            <span>닉네임</span>
            <input
              maxLength={12}
              onChange={(event) => setNickname(event.target.value)}
              placeholder="표시 이름"
              type="text"
              value={nickname}
            />
          </label>
          <button className="button button--primary" disabled={loginMutation.isPending} type="submit">
            {loginMutation.isPending ? "연결 중..." : "전장 접속"}
          </button>
        </form>
        <p className="auth-footnote">
          테스트 계정이 필요하면 <Link to="/signup">간단 등록 안내</Link>를 확인하십시오.
        </p>
      </section>
    </div>
  );
};
