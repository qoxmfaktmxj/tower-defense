import type { StageDefinition } from "../../core/types/gameTypes";

export const firstStage: StageDefinition = {
  id: "han-river-front",
  name: "한강 방어선",
  description: "중앙 교두보로 밀고 들어오는 적을 저지하는 첫 실전 구역입니다.",
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
  ]
};
