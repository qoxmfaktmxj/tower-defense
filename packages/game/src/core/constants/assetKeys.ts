export const ASSET_KEYS = {
  terrain: {
    grass: "terrain-grass",
    grassAlt: "terrain-grass-alt",
    roadHorizontal: "terrain-road-horizontal",
    roadVertical: "terrain-road-vertical",
    roadCornerLl: "terrain-road-corner-ll",
    roadCornerLr: "terrain-road-corner-lr",
    roadCornerUl: "terrain-road-corner-ul",
    roadCornerUr: "terrain-road-corner-ur",
    sand: "terrain-sand"
  },
  slots: {
    buildPad: "slot-build-pad"
  },
  towers: {
    arrow: "tower-arrow",
    cannon: "tower-cannon",
    frost: "tower-frost"
  },
  enemies: {
    grunt: "enemy-grunt",
    runner: "enemy-runner",
    tank: "enemy-tank",
    boss: "enemy-boss"
  },
  projectiles: {
    arrow: "projectile-arrow",
    cannon: "projectile-cannon"
  },
  props: {
    crateMetal: "prop-crate-metal",
    sandbag: "prop-sandbag",
    treeLarge: "prop-tree-large",
    treeSmall: "prop-tree-small",
    barricade: "prop-barricade"
  },
  effects: {
    hit: "effect-hit",
    explosion: "effect-explosion",
    freeze: "effect-freeze",
    trail: "effect-trail"
  }
} as const;
