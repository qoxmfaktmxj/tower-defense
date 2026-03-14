import { Link } from "react-router-dom";

export const SignupPage = () => {
  return (
    <div className="auth-shell auth-shell--single">
      <section className="auth-panel">
        <p className="panel-tag">ACCOUNT PREVIEW</p>
        <h1>테스트 계정 안내</h1>
        <p className="auth-copy">
          현재 빌드는 실제 회원가입 대신 간단 로그인 방식으로 운영합니다. 계정 확장은 다음 단계에서
          진행할 예정입니다.
        </p>
        <div className="stack-card">
          <h3>현재 제공 범위</h3>
          <ul className="plain-list">
            <li>이메일과 닉네임 기반 테스트 로그인</li>
            <li>전장 로비, 랭킹, 프로필, Phaser 전투 화면</li>
            <li>전투 결과 제출과 세션 저장</li>
          </ul>
        </div>
        <Link className="button button--primary" to="/login">
          로그인으로 돌아가기
        </Link>
      </section>
    </div>
  );
};
