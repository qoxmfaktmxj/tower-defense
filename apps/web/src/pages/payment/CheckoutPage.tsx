import { Link } from "react-router-dom";

export const CheckoutPage = () => {
  return (
    <article className="detail-card">
      <p className="panel-tag">PAYMENT FLOW</p>
      <h1>결제 시작 페이지</h1>
      <p className="detail-card__body">
        실제 결제사 SDK는 아직 연결하지 않았지만, 웹셸 라우트와 결과 페이지 구조는
        먼저 마련했습니다. 이후 서버 검증과 주문 확정은 payments 모듈에 연결하면
        됩니다.
      </p>
      <Link className="button button--primary" to="/payment/result?status=success">
        성공 결과 보기
      </Link>
    </article>
  );
};
