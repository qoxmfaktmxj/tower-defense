import type { StageDefinition } from "../../core/types/gameTypes";
import type { GameModeThemeDefinition } from "../gameModes";

export const resolveStageTheme = (
  baseTheme: GameModeThemeDefinition,
  stage: StageDefinition
): GameModeThemeDefinition => ({
  ...baseTheme,
  visuals: {
    ...baseTheme.visuals,
    ...stage.visuals
  }
});
