import Phaser from "phaser";
import type { Point, StageDefinition } from "../../core/types/gameTypes";

interface StagePreviewOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  backgroundTint: number;
  frameTint: number;
  accentTint: number;
  secondaryTint: number;
}

const FONT_FAMILY =
  '"Kenney Future Narrow", "Malgun Gothic", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif';

const normalizePoint = (
  point: Point,
  minX: number,
  minY: number,
  scale: number,
  paddingX: number,
  paddingY: number
) => ({
  x: paddingX + (point.x - minX) * scale,
  y: paddingY + (point.y - minY) * scale
});

export const createStagePreview = (
  scene: Phaser.Scene,
  stage: StageDefinition,
  options: StagePreviewOptions
) => {
  const container = scene.add.container(options.x, options.y);
  const background = scene.add
    .rectangle(0, 0, options.width, options.height, options.backgroundTint, 0.96)
    .setOrigin(0.5)
    .setStrokeStyle(2, options.frameTint, 0.84);
  const graphics = scene.add.graphics();

  const allPoints = [...stage.path, ...stage.buildSlots];
  const minX = Math.min(...allPoints.map((point) => point.x));
  const maxX = Math.max(...allPoints.map((point) => point.x));
  const minY = Math.min(...allPoints.map((point) => point.y));
  const maxY = Math.max(...allPoints.map((point) => point.y));
  const spanX = Math.max(maxX - minX, 1);
  const spanY = Math.max(maxY - minY, 1);
  const padding = 18;
  const scale = Math.min(
    (options.width - padding * 2) / spanX,
    (options.height - padding * 2) / spanY
  );
  const offsetX = -options.width / 2;
  const offsetY = -options.height / 2;
  const padX = offsetX + padding;
  const padY = offsetY + padding;

  graphics.fillStyle(0x050d13, 0.48);
  graphics.fillRoundedRect(offsetX + 6, offsetY + 6, options.width - 12, options.height - 12, 18);

  graphics.lineStyle(1, options.frameTint, 0.1);
  for (let x = offsetX + 16; x < options.width / 2; x += 28) {
    graphics.lineBetween(x, offsetY + 12, x, options.height / 2 - 12);
  }
  for (let y = offsetY + 12; y < options.height / 2; y += 28) {
    graphics.lineBetween(offsetX + 12, y, options.width / 2 - 12, y);
  }

  const mappedPath = stage.path.map((point) =>
    normalizePoint(point, minX, minY, scale, padX, padY)
  );

  graphics.lineStyle(20, 0x071015, 0.88);
  graphics.beginPath();
  graphics.moveTo(mappedPath[0]?.x ?? 0, mappedPath[0]?.y ?? 0);
  mappedPath.slice(1).forEach((point) => graphics.lineTo(point.x, point.y));
  graphics.strokePath();

  graphics.lineStyle(15, options.secondaryTint, 0.34);
  graphics.beginPath();
  graphics.moveTo(mappedPath[0]?.x ?? 0, mappedPath[0]?.y ?? 0);
  mappedPath.slice(1).forEach((point) => graphics.lineTo(point.x, point.y));
  graphics.strokePath();

  graphics.lineStyle(7, options.accentTint, 0.9);
  graphics.beginPath();
  graphics.moveTo(mappedPath[0]?.x ?? 0, mappedPath[0]?.y ?? 0);
  mappedPath.slice(1).forEach((point) => graphics.lineTo(point.x, point.y));
  graphics.strokePath();

  mappedPath.forEach((point, index) => {
    if (index % 2 === 0) {
      graphics.fillStyle(0xffffff, 0.42);
      graphics.fillCircle(point.x, point.y, 3);
    }
  });

  stage.buildSlots.forEach((slot) => {
    const mapped = normalizePoint(slot, minX, minY, scale, padX, padY);
    graphics.fillStyle(options.accentTint, 0.26);
    graphics.fillCircle(mapped.x, mapped.y, 9);
    graphics.fillStyle(options.frameTint, 0.95);
    graphics.fillCircle(mapped.x, mapped.y, 4.2);
    graphics.lineStyle(2, 0xffffff, 0.74);
    graphics.strokeCircle(mapped.x, mapped.y, 7.8);
  });

  const start = mappedPath[0];
  const end = mappedPath[mappedPath.length - 1];
  if (start) {
    graphics.fillStyle(0xffffff, 0.95);
    graphics.fillCircle(start.x, start.y, 5);
  }
  if (end) {
    graphics.fillStyle(options.accentTint, 0.95);
    graphics.fillCircle(end.x, end.y, 6);
  }

  const label = scene.add
    .text(offsetX + 16, offsetY + 12, stage.presentation.tagline, {
      fontFamily: FONT_FAMILY,
      fontSize: "14px",
      color: "#dff4ff"
    })
    .setOrigin(0, 0);

  container.add([background, graphics, label]);
  return container;
};
