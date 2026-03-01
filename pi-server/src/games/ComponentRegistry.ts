import { GAME_TYPE, type GameType } from "@/types/GameTypes";
import { MinecraftComponents } from "./minecraft/MinecraftComponents";
import { SatisfactoryComponents } from "./satisfactory/SatisfactoryComponents";

/*
 * The component registry acts as a central hub for
 * mapping where each games front-end logic will lie
 */
export const ComponentRegistry: Record<GameType, any> = {
  [GAME_TYPE.MINECRAFT]: MinecraftComponents,
  [GAME_TYPE.DEFAULT]: undefined,
  [GAME_TYPE.ARK]: undefined,
  [GAME_TYPE.RUST]: undefined,
  [GAME_TYPE.VALHEIM]: undefined,
  [GAME_TYPE.SATISFACTORY]: SatisfactoryComponents,
};
