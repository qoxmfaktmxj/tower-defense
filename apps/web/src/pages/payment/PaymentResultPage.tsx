import { Link, useSearchParams } from "react-router-dom";

export const PaymentResultPage = () => {
  const [params] = useSearchParams();
  const status = params.get("status");
  const isSuccess = status !== "fail";

  return (
    <article className="detail-card">
      <p className="panel-tag">PAYMENT RESULT</p>
      <h1>{isSuccess ? "결제가 정상적으로 접수되었습니다" : "결제가 취소되었습니다"}</h1>
      <p className="detail-card__body">
        {isSuccess
          ? "실서비스에서는 이 화면 진입 후 서버가 결제 승인 상태를 다시 확인하고 주문을 최종 확정합니다."
          : "다시 시도하거나 로비로 돌아가 다른 콘텐츠를 먼저 둘러볼 수 있습니다."}
      </p>
      <div className="hero-card__actions">
        <Link className="button button--primary" to="/lobby">
          로비로 돌아가기
        </Link>
        <Link className="button button--ghost" to="/game">
          전장으로 이동
        </Link>
      </div>
    </article>
  );
};
