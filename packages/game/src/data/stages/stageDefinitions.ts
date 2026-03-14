import type { StageDefinition, StageId } from "../../core/types/gameTypes";

export const stageDefinitions: Record<StageId, StageDefinition> = {
  "han-river-front": {
    id: "han-river-front",
    name: "한강 방어선",
    description: "긴 직선과 완만한 회전이 이어지는 수변 보급로입니다. 기본 포대 효율이 높은 전장입니다.",
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
    zones: [{ kind: "sand", x: 830, y: 120, cols: 2, rows: 3, alpha: 0.68 }],
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
      backgroundColor: "#07151c",
      grassTint: 0x0f242d,
      grassAltTint: 0x14323d,
      roadTint: 0x768894,
      patchTint: 0x21353c,
      slotAvailableTint: 0x1dd7c2,
      slotOccupiedTint: 0x3b5663,
      slotSelectedTint: 0x59e1ff,
      slotGlowTint: 0x2fd6ff,
      propTint: 0xc8d7de,
      startTint: 0x1dd7c2,
      endTint: 0xf1c35a,
      overdriveTint: 0x7ef8eb
    },
    atmosphere: {
      glowTint: 0x0dcac6,
      glowTintAlt: 0x1f5f84,
      glowAlpha: 0.14,
      hazeTint: 0x061118,
      hazeAlpha: 0.42,
      pathGuideTint: 0x8fe8ff,
      pathGuideAlpha: 0.18,
      panelTint: 0x0a141b,
      panelStrokeTint: 0x2b6675
    },
    presentation: {
      tagline: "강변 전력선 유지",
      sector: "한강 북단 제7방어선",
      threatLevel: "보통",
      weather: "수면 안개와 습기",
      recommendedTower: "arrow",
      recommendedTowerLabel: "기관 포대",
      tacticalNote: "직선 구간이 길어 기관 포대 중첩과 중화기 후방 배치가 안정적으로 통합니다."
    }
  },
  "metro-grid": {
    id: "metro-grid",
    name: "메트로 그리드",
    description: "도심 전력망 위를 굽이치는 교차 경로입니다. 감속과 교차 사격 효율이 높습니다.",
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
      { kind: "sand", x: 108, y: 410, cols: 2, rows: 2, alpha: 0.54 },
      { kind: "grassAlt", x: 734, y: 84, cols: 2, rows: 2, alpha: 0.42 }
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
      backgroundColor: "#0a111a",
      grassTint: 0x14212c,
      grassAltTint: 0x1c2c39,
      roadTint: 0x7e8794,
      patchTint: 0x1d2d37,
      slotAvailableTint: 0x39d4ff,
      slotOccupiedTint: 0x3a4d64,
      slotSelectedTint: 0x84f3ff,
      slotGlowTint: 0x49d8ff,
      propTint: 0xc8d4df,
      startTint: 0x2ad7ff,
      endTint: 0xff6b61,
      overdriveTint: 0x7cecff
    },
    atmosphere: {
      glowTint: 0x1f7fc4,
      glowTintAlt: 0x2be7ff,
      glowAlpha: 0.12,
      hazeTint: 0x060d14,
      hazeAlpha: 0.44,
      pathGuideTint: 0xa4e6ff,
      pathGuideAlpha: 0.16,
      panelTint: 0x0b121a,
      panelStrokeTint: 0x2d4f6c
    },
    presentation: {
      tagline: "도심 전력망 봉쇄",
      sector: "메트로 구역 7 전력선",
      threatLevel: "상",
      weather: "차가운 도심 조명",
      recommendedTower: "frost",
      recommendedTowerLabel: "빙결 포대",
      tacticalNote: "교차 구간이 많아 빙결 포대로 적을 묶고 중화기를 뒤에서 받치는 운용이 강합니다."
    }
  },
  "red-canyon": {
    id: "red-canyon",
    name: "레드 캐니언",
    description: "협곡 벽을 따라 상승과 하강이 반복되는 보급로입니다. 후반 중장갑 압박이 강합니다.",
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
      { kind: "sand", x: 106, y: 92, cols: 3, rows: 2, alpha: 0.72 },
      { kind: "sand", x: 758, y: 430, cols: 2, rows: 2, alpha: 0.62 }
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
      backgroundColor: "#171008",
      grassTint: 0x302219,
      grassAltTint: 0x453125,
      roadTint: 0xa68871,
      patchTint: 0x55412d,
      slotAvailableTint: 0xffb45f,
      slotOccupiedTint: 0x684735,
      slotSelectedTint: 0xffdf8a,
      slotGlowTint: 0xff9257,
      propTint: 0xe5c3a0,
      startTint: 0xff944f,
      endTint: 0xff5d4d,
      overdriveTint: 0xffdd8e
    },
    atmosphere: {
      glowTint: 0xdb6638,
      glowTintAlt: 0x7a341f,
      glowAlpha: 0.16,
      hazeTint: 0x120b06,
      hazeAlpha: 0.48,
      pathGuideTint: 0xffd38b,
      pathGuideAlpha: 0.14,
      panelTint: 0x160f09,
      panelStrokeTint: 0x7f4d32
    },
    presentation: {
      tagline: "협곡 보급선 방어",
      sector: "서부 협곡 3차 보급선",
      threatLevel: "상",
      weather: "고열과 적색 먼지",
      recommendedTower: "cannon",
      recommendedTowerLabel: "중화기 포대",
      tacticalNote: "중장갑 파고가 길게 이어져 화력 집중이 중요합니다. 빙결 포대는 후방 보조 정도로 운용하십시오."
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
