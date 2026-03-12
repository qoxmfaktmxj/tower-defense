import type { StageDefinition, StageId } from "../../core/types/gameTypes";

export const stageDefinitions: Record<StageId, StageDefinition> = {
  "han-river-front": {
    id: "han-river-front",
    name: "한강 방어선",
    description: "초입과 교차로가 많은 기본 전장입니다. 안정적인 첫 방어선 구축에 적합합니다.",
    width: 960,
    height: 540,
    initialGold: 260,
    initialLives: 20,
    path: [
      { x: 40, y: 270 },
      { x: 220, y: 270 },
      { x: 220, y: 110 },
      { x: 470, y: 110 },
      { x: 470, y: 420 },
      { x: 760, y: 420 },
      { x: 760, y: 180 },
      { x: 920, y: 180 }
    ],
    buildSlots: [
      { id: "A1", x: 130, y: 188 },
      { id: "A2", x: 302, y: 182 },
      { id: "A3", x: 386, y: 340 },
      { id: "A4", x: 552, y: 172 },
      { id: "A5", x: 636, y: 338 },
      { id: "A6", x: 686, y: 474 },
      { id: "A7", x: 810, y: 302 },
      { id: "A8", x: 846, y: 94 }
    ],
    zones: [{ kind: "sand", x: 830, y: 120, cols: 2, rows: 3, alpha: 0.96 }],
    props: [
      { kind: "treeLarge", x: 98, y: 74, scale: 1.06, depth: 1.4 },
      { kind: "treeSmall", x: 164, y: 468, scale: 1, angle: 12, depth: 1.4 },
      { kind: "crateMetal", x: 312, y: 466, scale: 1, depth: 1.5 },
      { kind: "sandbag", x: 410, y: 198, scale: 1.05, depth: 1.5 },
      { kind: "barricade", x: 572, y: 296, scale: 1, angle: 90, depth: 1.5 },
      { kind: "treeSmall", x: 628, y: 76, scale: 0.92, angle: -10, depth: 1.4 },
      { kind: "crateMetal", x: 704, y: 82, scale: 1, depth: 1.5 },
      { kind: "treeLarge", x: 870, y: 440, scale: 1.08, depth: 1.4 }
    ]
  },
  "metro-grid": {
    id: "metro-grid",
    name: "메트로 그리드",
    description: "긴 직선과 깊은 코너가 반복되는 도심형 전장입니다. 사거리 효율이 중요합니다.",
    width: 960,
    height: 540,
    initialGold: 280,
    initialLives: 20,
    path: [
      { x: 40, y: 110 },
      { x: 300, y: 110 },
      { x: 300, y: 420 },
      { x: 560, y: 420 },
      { x: 560, y: 170 },
      { x: 820, y: 170 },
      { x: 820, y: 470 },
      { x: 920, y: 470 }
    ],
    buildSlots: [
      { id: "B1", x: 136, y: 196 },
      { id: "B2", x: 230, y: 320 },
      { id: "B3", x: 382, y: 70 },
      { id: "B4", x: 424, y: 330 },
      { id: "B5", x: 508, y: 488 },
      { id: "B6", x: 648, y: 82 },
      { id: "B7", x: 716, y: 260 },
      { id: "B8", x: 748, y: 516 },
      { id: "B9", x: 890, y: 318 }
    ],
    zones: [
      { kind: "sand", x: 108, y: 410, cols: 2, rows: 2, alpha: 0.92 },
      { kind: "grassAlt", x: 734, y: 84, cols: 2, rows: 2, alpha: 0.78 }
    ],
    props: [
      { kind: "barricade", x: 88, y: 52, scale: 1, depth: 1.5 },
      { kind: "crateMetal", x: 180, y: 486, scale: 1.02, depth: 1.5 },
      { kind: "treeSmall", x: 258, y: 232, scale: 0.9, depth: 1.4 },
      { kind: "sandbag", x: 512, y: 104, scale: 1.02, depth: 1.5 },
      { kind: "treeLarge", x: 610, y: 500, scale: 1.06, depth: 1.4 },
      { kind: "crateMetal", x: 694, y: 496, scale: 1, depth: 1.5 },
      { kind: "barricade", x: 890, y: 120, scale: 1.02, angle: 90, depth: 1.5 },
      { kind: "treeSmall", x: 908, y: 392, scale: 0.92, depth: 1.4 }
    ]
  },
  "red-canyon": {
    id: "red-canyon",
    name: "레드 캐니언",
    description: "긴 초입과 다층 코너가 이어지는 사막형 전장입니다. 후반 화력이 크게 요구됩니다.",
    width: 960,
    height: 540,
    initialGold: 300,
    initialLives: 20,
    path: [
      { x: 40, y: 420 },
      { x: 210, y: 420 },
      { x: 210, y: 220 },
      { x: 410, y: 220 },
      { x: 410, y: 80 },
      { x: 690, y: 80 },
      { x: 690, y: 320 },
      { x: 860, y: 320 },
      { x: 860, y: 170 },
      { x: 920, y: 170 }
    ],
    buildSlots: [
      { id: "C1", x: 108, y: 330 },
      { id: "C2", x: 164, y: 492 },
      { id: "C3", x: 304, y: 306 },
      { id: "C4", x: 346, y: 144 },
      { id: "C5", x: 492, y: 170 },
      { id: "C6", x: 576, y: 172 },
      { id: "C7", x: 626, y: 404 },
      { id: "C8", x: 760, y: 238 },
      { id: "C9", x: 814, y: 92 },
      { id: "C10", x: 904, y: 270 }
    ],
    zones: [
      { kind: "sand", x: 106, y: 92, cols: 3, rows: 2, alpha: 0.94 },
      { kind: "sand", x: 758, y: 430, cols: 2, rows: 2, alpha: 0.9 }
    ],
    props: [
      { kind: "treeSmall", x: 82, y: 260, scale: 0.94, depth: 1.4 },
      { kind: "sandbag", x: 154, y: 144, scale: 1.02, depth: 1.5 },
      { kind: "crateMetal", x: 256, y: 516, scale: 1.04, depth: 1.5 },
      { kind: "barricade", x: 462, y: 288, scale: 1, angle: 90, depth: 1.5 },
      { kind: "treeLarge", x: 564, y: 478, scale: 1.08, depth: 1.4 },
      { kind: "crateMetal", x: 646, y: 508, scale: 1.02, depth: 1.5 },
      { kind: "sandbag", x: 780, y: 388, scale: 1, depth: 1.5 },
      { kind: "treeSmall", x: 896, y: 48, scale: 0.9, depth: 1.4 }
    ]
  }
};

export const defaultStageId: StageId = "han-river-front";

export const stageCatalog = Object.values(stageDefinitions).map(({ id, name, description }) => ({
  id,
  name,
  description
}));

export const getStageDefinition = (stageId: StageId) =>
  stageDefinitions[stageId] ?? stageDefinitions[defaultStageId];
