export type ServerCardProps = {
  id?: string;
  name: string;
  status: ServerState;
  gameType: string;
  version: string;
  playerCount: string;
  port?: number;
};

export type ServerState =
  | "offline"
  | "starting"
  | "online"
  | "stopping"
  | "restarting";
