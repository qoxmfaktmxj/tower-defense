import { getStageDefinition, type StageId } from "@tower-defense/game";

interface StageRoutePreviewProps {
  stageId: StageId;
  className?: string;
}

const numberToHex = (value: number | undefined, fallback: string) =>
  value === undefined ? fallback : `#${value.toString(16).padStart(6, "0")}`;

const createGridLines = (
  width: number,
  height: number,
  step: number,
  orientation: "vertical" | "horizontal"
) => {
  const count = Math.floor((orientation === "vertical" ? width : height) / step);
  return Array.from({ length: count }, (_, index) => {
    const position = step * (index + 1);
    return orientation === "vertical"
      ? `M ${position} 0 V ${height}`
      : `M 0 ${position} H ${width}`;
  }).join(" ");
};

export const StageRoutePreview = ({ stageId, className }: StageRoutePreviewProps) => {
  const stage = getStageDefinition(stageId);
  const allPoints = [...stage.path, ...stage.buildSlots];
  const minX = Math.min(...allPoints.map((point) => point.x));
  const maxX = Math.max(...allPoints.map((point) => point.x));
  const minY = Math.min(...allPoints.map((point) => point.y));
  const maxY = Math.max(...allPoints.map((point) => point.y));
  const spanX = Math.max(maxX - minX, 1);
  const spanY = Math.max(maxY - minY, 1);
  const padding = 72;
  const scale = Math.min((960 - padding * 2) / spanX, (540 - padding * 2) / spanY);

  const mapPoint = (x: number, y: number) => ({
    x: padding + (x - minX) * scale,
    y: padding + (y - minY) * scale
  });

  const pathPoints = stage.path.map((point) => {
    const mapped = mapPoint(point.x, point.y);
    return `${mapped.x},${mapped.y}`;
  });

  const slotPoints = stage.buildSlots.map((slot) => ({
    id: slot.id,
    ...mapPoint(slot.x, slot.y)
  }));

  const startPoint = stage.path[0] ? mapPoint(stage.path[0].x, stage.path[0].y) : null;
  const endPoint = stage.path.at(-1)
    ? mapPoint(stage.path.at(-1)!.x, stage.path.at(-1)!.y)
    : null;

  const background = stage.visuals?.backgroundColor ?? "#0c1820";
  const routeEdge = numberToHex(stage.atmosphere.panelStrokeTint, "#34576a");
  const routeMain = numberToHex(stage.visuals?.roadTint, "#7fa9b8");
  const slotFill = numberToHex(stage.visuals?.slotAvailableTint, "#28e3d1");
  const slotStroke = numberToHex(stage.visuals?.slotSelectedTint, "#59e1ff");
  const startFill = numberToHex(stage.visuals?.startTint, "#18d4c2");
  const endFill = numberToHex(stage.visuals?.endTint, "#f1c35a");
  const accentGlow = numberToHex(stage.atmosphere.glowTint, "#12404d");
  const guideTint = numberToHex(stage.atmosphere.pathGuideTint, "#8fdfff");

  return (
    <div className={className ? `stage-preview ${className}` : "stage-preview"} aria-hidden="true">
      <svg className="stage-preview__svg" viewBox="0 0 960 540">
        <defs>
          <linearGradient id={`stage-surface-${stage.id}`} x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor={background} />
            <stop offset="100%" stopColor="#081118" />
          </linearGradient>
          <radialGradient id={`stage-glow-${stage.id}`} cx="20%" cy="20%" r="80%">
            <stop offset="0%" stopColor={accentGlow} stopOpacity="0.72" />
            <stop offset="100%" stopColor={accentGlow} stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect fill={`url(#stage-surface-${stage.id})`} height="540" rx="42" width="960" />
        <rect
          fill={`url(#stage-glow-${stage.id})`}
          height="540"
          opacity="0.7"
          rx="42"
          width="960"
        />
        <path
          d={createGridLines(960, 540, 120, "vertical")}
          fill="none"
          opacity="0.16"
          stroke={guideTint}
          strokeWidth="1"
        />
        <path
          d={createGridLines(960, 540, 108, "horizontal")}
          fill="none"
          opacity="0.16"
          stroke={guideTint}
          strokeWidth="1"
        />

        <polyline
          fill="none"
          opacity="0.92"
          points={pathPoints.join(" ")}
          stroke={routeEdge}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="52"
        />
        <polyline
          fill="none"
          opacity="0.96"
          points={pathPoints.join(" ")}
          stroke={routeMain}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="36"
        />
        <polyline
          fill="none"
          opacity="0.52"
          points={pathPoints.join(" ")}
          stroke="#d9f7ff"
          strokeDasharray="14 18"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="6"
        />

        {slotPoints.map((slot) => (
          <g key={slot.id}>
            <circle cx={slot.x} cy={slot.y} fill={slotFill} opacity="0.22" r="28" />
            <circle cx={slot.x} cy={slot.y} fill={slotFill} opacity="0.84" r="11" />
            <circle
              cx={slot.x}
              cy={slot.y}
              fill="none"
              opacity="0.92"
              r="18"
              stroke={slotStroke}
              strokeWidth="4"
            />
          </g>
        ))}

        {startPoint ? <circle cx={startPoint.x} cy={startPoint.y} fill={startFill} r="18" /> : null}
        {endPoint ? <circle cx={endPoint.x} cy={endPoint.y} fill={endFill} r="20" /> : null}
      </svg>
    </div>
  );
};
