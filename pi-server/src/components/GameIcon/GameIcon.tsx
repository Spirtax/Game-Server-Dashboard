import { GAME_TYPE, type GameType } from "@/types/GameTypes";
import { getGameIcon } from "@/games/utils/iconLoader";

type GameIconProps = {
  game: GameType;
  size?: number;
  className?: string;
};

export default function GameIcon({
  game = GAME_TYPE.DEFAULT,
  size = 32,
  className = "",
}: GameIconProps) {
  const iconSrc = getGameIcon(game);

  return (
    <img
      src={iconSrc}
      alt={`${game} icon`}
      width={size}
      height={size}
      className={className}
      style={{ objectFit: "contain" }}
    />
  );
}
