const iconModules = import.meta.glob("@/games/*/icon.png", {
  eager: true,
  query: "?url",
  import: "default",
});

export const getGameIcon = (game: string): string => {
  const path = `/src/games/${game.toLowerCase()}/icon.png`;
  return (iconModules[path] as string) || "/src/assets/icons/default.png";
};
