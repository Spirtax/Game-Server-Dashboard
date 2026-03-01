import { GAME_TYPE, type GameType } from "@/types/GameTypes";
import { MinecraftProvider } from "./minecraft/MinecraftProvider";
import { SatisfactoryProvider } from "./satisfactory/SatisfactoryProvider";

/*
 * The Provider registry acts as a central hub for
 * mapping where each games back-end logic will lie
 */
export const ProviderRegistry: Record<GameType, any> = {
  [GAME_TYPE.MINECRAFT]: MinecraftProvider,
  [GAME_TYPE.DEFAULT]: undefined,
  [GAME_TYPE.ARK]: undefined,
  [GAME_TYPE.RUST]: undefined,
  [GAME_TYPE.VALHEIM]: undefined,
  [GAME_TYPE.SATISFACTORY]: SatisfactoryProvider,
};
