import { Link } from "react-router-dom";

export const SignupPage = () => {
  return (
    <div className="auth-shell">
      <section className="auth-panel">
        <p className="panel-tag">SIGNUP PREVIEW</p>
        <h1>시범 계정 등록</h1>
        <p className="auth-copy">
          실제 인증 흐름은 이후 단계에서 확장할 수 있도록 비워두고, 현재는 로그인
          페이지의 간단 접속 플로우를 기준으로 MVP를 진행합니다.
        </p>
        <div className="stack-card">
          <h3>현재 제공 범위</h3>
          <p>이메일 기반 간단 로그인, 한국어 로비, Phaser 전장, 결과 제출 목업.</p>
        </div>
        <Link className="button button--primary" to="/login">
          로그인으로 돌아가기
        </Link>
      </section>
    </div>
  );
};
