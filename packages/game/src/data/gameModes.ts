import { ASSET_KEYS } from "../core/constants/assetKeys";
import type {
  EnemyKind,
  GameModeId,
  StagePropKind,
  TowerKind
} from "../core/types/gameTypes";

export interface GameModeCatalogEntry {
  id: GameModeId;
  name: string;
  label: string;
  description: string;
}

export interface GameModeThemeDefinition extends GameModeCatalogEntry {
  assets: {
    terrain: Record<keyof typeof ASSET_KEYS.terrain, string>;
    slot: string;
    towers: Record<TowerKind, string>;
    enemies: Record<EnemyKind, string>;
    projectiles: {
      arrow: string;
      cannon: string;
      frost: string;
    };
    props: Record<StagePropKind, string>;
    effects: Record<keyof typeof ASSET_KEYS.effects, string>;
  };
  visuals: {
    backgroundColor: string;
    grassTint: number;
    grassAltTint: number;
    roadTint: number;
    patchTint: number;
    slotAvailableTint: number;
    slotOccupiedTint: number;
    slotSelectedTint: number;
    slotGlowTint: number;
    towerPlateOuter: number;
    towerPlateInner: number;
    towerSelectedTint: number;
    towerScales: Record<TowerKind, number>;
    enemyScales: Record<EnemyKind, number>;
    projectileTints: Record<TowerKind, number>;
    hitTint: number;
    explosionTint: number;
    freezeTint: number;
    startTint: number;
    endTint: number;
    propTint: number;
    overdriveTint: number;
  };
}

export const defaultGameModeId: GameModeId = "mode-a";

const currentAssetRoot = "/assets/game";

export const gameModeDefinitions: Record<GameModeId, GameModeThemeDefinition> = {
  "mode-a": {
    id: "mode-a",
    name: "프론트라인",
    label: "기본 전장 테마",
    description: "기본 타워 디펜스 전장입니다. 시야가 깔끔하고 정보가 가장 잘 읽힙니다.",
    assets: {
      terrain: {
        grass: `${currentAssetRoot}/terrain/grass.png`,
        grassAlt: `${currentAssetRoot}/terrain/grass-alt.png`,
        roadHorizontal: `${currentAssetRoot}/terrain/road-horizontal.png`,
        roadVertical: `${currentAssetRoot}/terrain/road-vertical.png`,
        roadCornerLl: `${currentAssetRoot}/terrain/road-corner-ll.png`,
        roadCornerLr: `${currentAssetRoot}/terrain/road-corner-lr.png`,
        roadCornerUl: `${currentAssetRoot}/terrain/road-corner-ul.png`,
        roadCornerUr: `${currentAssetRoot}/terrain/road-corner-ur.png`,
        sand: `${currentAssetRoot}/terrain/path-sand.png`
      },
      slot: `${currentAssetRoot}/slots/build-slot.png`,
      towers: {
        arrow: `${currentAssetRoot}/towers/arrow.png`,
        cannon: `${currentAssetRoot}/towers/cannon.png`,
        frost: `${currentAssetRoot}/towers/frost.png`
      },
      enemies: {
        grunt: `${currentAssetRoot}/enemies/grunt.png`,
        runner: `${currentAssetRoot}/enemies/runner.png`,
        tank: `${currentAssetRoot}/enemies/tank.png`,
        boss: `${currentAssetRoot}/enemies/boss.png`
      },
      projectiles: {
        arrow: `${currentAssetRoot}/projectiles/arrow-shot.png`,
        cannon: `${currentAssetRoot}/projectiles/cannon-shot.png`,
        frost: `${currentAssetRoot}/effects/trail.png`
      },
      props: {
        crateMetal: `${currentAssetRoot}/props/crate-metal.png`,
        sandbag: `${currentAssetRoot}/props/sandbag.png`,
        treeLarge: `${currentAssetRoot}/props/tree-large.png`,
        treeSmall: `${currentAssetRoot}/props/tree-small.png`,
        barricade: `${currentAssetRoot}/props/barricade.png`
      },
      effects: {
        hit: `${currentAssetRoot}/effects/hit.png`,
        explosion: `${currentAssetRoot}/effects/explosion.png`,
        freeze: `${currentAssetRoot}/effects/freeze.png`,
        trail: `${currentAssetRoot}/effects/trail.png`
      }
    },
    visuals: {
      backgroundColor: "#071118",
      grassTint: 0xffffff,
      grassAltTint: 0xe7fff1,
      roadTint: 0xffffff,
      patchTint: 0xffffff,
      slotAvailableTint: 0x74d88b,
      slotOccupiedTint: 0x68d4ef,
      slotSelectedTint: 0xf4c15b,
      slotGlowTint: 0x68d4ef,
      towerPlateOuter: 0x0f2933,
      towerPlateInner: 0x1c4d5d,
      towerSelectedTint: 0xffffff,
      towerScales: {
        arrow: 0.9,
        cannon: 0.96,
        frost: 0.9
      },
      enemyScales: {
        grunt: 0.82,
        runner: 0.84,
        tank: 0.88,
        boss: 0.94
      },
      projectileTints: {
        arrow: 0xffffff,
        cannon: 0xffffff,
        frost: 0xa8e7ff
      },
      hitTint: 0xffffff,
      explosionTint: 0xffc16d,
      freezeTint: 0x9edcff,
      startTint: 0x69d7f2,
      endTint: 0xf4c15b,
      propTint: 0xffffff,
      overdriveTint: 0xfff1a6
    }
  }
};

export const gameModeCatalog = Object.values(gameModeDefinitions).map(
  ({ id, name, label, description }) => ({
    id,
    name,
    label,
    description
  })
);

export const getGameModeDefinition = (modeId: GameModeId) =>
  gameModeDefinitions[modeId] ?? gameModeDefinitions[defaultGameModeId];
