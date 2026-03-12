import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GameRunResult } from "@tower-defense/shared";
import type { StageId } from "@tower-defense/game";

interface UiState {
  isLoggedIn: boolean;
  nickname: string;
  volume: number;
  selectedStageId: StageId;
  lastResult: GameRunResult | null;
  logIn: (nickname: string) => void;
  logOut: () => void;
  setVolume: (volume: number) => void;
  setSelectedStageId: (stageId: StageId) => void;
  rememberResult: (result: GameRunResult) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      nickname: "지휘관",
      volume: 0.75,
      selectedStageId: "han-river-front",
      lastResult: null,
      logIn: (nickname) =>
        set({
          isLoggedIn: true,
          nickname
        }),
      logOut: () =>
        set({
          isLoggedIn: false,
          nickname: "지휘관"
        }),
      setVolume: (volume) =>
        set({
          volume
        }),
      setSelectedStageId: (selectedStageId) =>
        set({
          selectedStageId
        }),
      rememberResult: (result) =>
        set({
          lastResult: result
        })
    }),
    {
      name: "tower-defense-ui"
    }
  )
);
