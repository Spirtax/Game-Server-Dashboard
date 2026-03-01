export const GAME_TYPE = {
  DEFAULT: "default",
  MINECRAFT: "minecraft",
  ARK: "ark",
  RUST: "rust",
  VALHEIM: "valheim",
  SATISFACTORY: "satisfactory",
} as const;

export type GameType = (typeof GAME_TYPE)[keyof typeof GAME_TYPE];

export const GAME_TYPES = Object.values(GAME_TYPE);
