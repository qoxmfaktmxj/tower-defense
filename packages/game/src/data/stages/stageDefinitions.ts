import type { StageDefinition, StageId } from "../../core/types/gameTypes";

export const stageDefinitions: Record<StageId, StageDefinition> = {
  "han-river-front": {
    id: "han-river-front",
    name: "한강 방어선",
    description:
      "강변 보급로를 따라 적이 길게 밀고 들어옵니다. 긴 직선 구간이 많아 기본 포대 운영이 쉬운 전장입니다.",
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
    ],
    visuals: {
      backgroundColor: "#f6fffb",
      grassTint: 0xd7fdec,
      grassAltTint: 0xb2e4db,
      roadTint: 0xfbfffd,
      patchTint: 0xeef8ef,
      slotAvailableTint: 0xa9fbd7,
      slotOccupiedTint: 0xb0c6ce,
      slotSelectedTint: 0x938ba1,
      slotGlowTint: 0xb2e4db,
      propTint: 0xf8fffc,
      startTint: 0xa9fbd7,
      endTint: 0x938ba1,
      overdriveTint: 0xd7fdec
    },
    atmosphere: {
      glowTint: 0xb2e4db,
      glowTintAlt: 0xa9fbd7,
      glowAlpha: 0.16,
      hazeTint: 0xf4fffb,
      hazeAlpha: 0.28,
      pathGuideTint: 0xb0c6ce,
      pathGuideAlpha: 0.22,
      panelTint: 0xf8fffc,
      panelStrokeTint: 0x938ba1
    },
    presentation: {
      tagline: "강변 방어선 유지",
      sector: "한강 북단 제7전력선",
      threatLevel: "보통",
      weather: "습기 짙은 강안 지역",
      recommendedTower: "arrow",
      recommendedTowerLabel: "기관 포대",
      tacticalNote: "직선 구간이 길어 기관 포대를 여러 개 겹치면 초반 방어가 안정됩니다."
    }
  },
  "metro-grid": {
    id: "metro-grid",
    name: "메트로 그리드",
    description:
      "차가운 도시 전력망을 따라 적이 방향을 자주 바꿉니다. 감속과 교차 화력이 중요한 전장입니다.",
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
    ],
    visuals: {
      backgroundColor: "#f4fbfd",
      grassTint: 0xd7f0ec,
      grassAltTint: 0xb0c6ce,
      roadTint: 0xfbfeff,
      patchTint: 0xe5eef1,
      slotAvailableTint: 0xb2e4db,
      slotOccupiedTint: 0x938ba1,
      slotSelectedTint: 0xa9fbd7,
      slotGlowTint: 0xb0c6ce,
      propTint: 0xf5fbff,
      startTint: 0xb2e4db,
      endTint: 0x938ba1,
      overdriveTint: 0xd7fdec
    },
    atmosphere: {
      glowTint: 0xb0c6ce,
      glowTintAlt: 0xb2e4db,
      glowAlpha: 0.14,
      hazeTint: 0xf0f5f6,
      hazeAlpha: 0.32,
      pathGuideTint: 0x938ba1,
      pathGuideAlpha: 0.18,
      panelTint: 0xf7fcfe,
      panelStrokeTint: 0x938ba1
    },
    presentation: {
      tagline: "도심 전력망 교전",
      sector: "메트로 구역 7 전력선",
      threatLevel: "상",
      weather: "차가운 도시 조명",
      recommendedTower: "frost",
      recommendedTowerLabel: "빙결 포대",
      tacticalNote:
        "코너와 교차 구간이 많아 빙결 포대와 중화기 포대를 섞으면 후반 유지력이 좋아집니다."
    }
  },
  "red-canyon": {
    id: "red-canyon",
    name: "레드 캐니언",
    description: "건조한 협곡 보급로입니다. 후반 중장갑과 보스 압박이 강한 전장입니다.",
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
    ],
    visuals: {
      backgroundColor: "#fbf7fd",
      grassTint: 0xe8dbef,
      grassAltTint: 0xd8c9e1,
      roadTint: 0xfffbff,
      patchTint: 0xf0e5f5,
      slotAvailableTint: 0xb2e4db,
      slotOccupiedTint: 0x938ba1,
      slotSelectedTint: 0xa9fbd7,
      slotGlowTint: 0x938ba1,
      propTint: 0xfdf9ff,
      startTint: 0xb2e4db,
      endTint: 0x938ba1,
      overdriveTint: 0xd7fdec
    },
    atmosphere: {
      glowTint: 0x938ba1,
      glowTintAlt: 0xb0c6ce,
      glowAlpha: 0.16,
      hazeTint: 0xf8effb,
      hazeAlpha: 0.34,
      pathGuideTint: 0xb0c6ce,
      pathGuideAlpha: 0.2,
      panelTint: 0xfcf8ff,
      panelStrokeTint: 0x938ba1
    },
    presentation: {
      tagline: "협곡 보급로 차단",
      sector: "서부 협곡 수송선",
      threatLevel: "최상",
      weather: "모래먼지와 열기",
      recommendedTower: "cannon",
      recommendedTowerLabel: "중화기 포대",
      tacticalNote:
        "후반 중장갑 비중이 높아 중화기 포대를 먼저 준비하고 보스 진입 구간에 화력을 집중해야 합니다."
    }
  }
};

export const defaultStageId: StageId = "han-river-front";

export const stageCatalog = Object.values(stageDefinitions).map(
  ({ id, name, description, presentation }) => ({
    id,
    name,
    description,
    tagline: presentation.tagline,
    sector: presentation.sector,
    threatLevel: presentation.threatLevel,
    weather: presentation.weather,
    recommendedTower: presentation.recommendedTower,
    recommendedTowerLabel: presentation.recommendedTowerLabel,
    tacticalNote: presentation.tacticalNote
  })
);

export const getStageDefinition = (stageId: StageId) =>
  stageDefinitions[stageId] ?? stageDefinitions[defaultStageId];
