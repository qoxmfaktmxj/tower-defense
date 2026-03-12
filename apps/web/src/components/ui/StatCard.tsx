import { PropsWithChildren } from "react";

interface StatCardProps {
  label: string;
  value: string;
  accent?: "teal" | "amber" | "coral";
}

export const StatCard = ({
  label,
  value,
  accent = "teal",
  children
}: PropsWithChildren<StatCardProps>) => {
  return (
    <article className={`stat-card stat-card--${accent}`}>
      <p className="stat-card__label">{label}</p>
      <strong className="stat-card__value">{value}</strong>
      {children ? <div className="stat-card__meta">{children}</div> : null}
    </article>
  );
};
