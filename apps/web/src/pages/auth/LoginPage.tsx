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
      <section className="auth-panel">
        <p className="panel-tag">KOREAN MVP</p>
        <h1>타워 디펜스에 접속</h1>
        <p className="auth-copy">
          한국어 UI 기준으로 구성한 브라우저 타워 디펜스입니다. 로그인 후 로비에서 랭킹을 확인하고
          바로 전장으로 출격할 수 있습니다.
        </p>
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
              placeholder="게임 내 표시 이름"
              type="text"
              value={nickname}
            />
          </label>
          <button className="button button--primary" disabled={loginMutation.isPending} type="submit">
            {loginMutation.isPending ? "접속 중..." : "지휘 연결"}
          </button>
        </form>
        <p className="auth-footnote">
          계정이 없다면 <Link to="/signup">테스트 계정 등록</Link> 페이지로 이동하세요.
        </p>
      </section>
    </div>
  );
};
