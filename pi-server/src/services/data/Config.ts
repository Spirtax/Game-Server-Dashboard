import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { StatType } from "@/types/StatType";
import { GAME_TYPE, type GameType } from "@/types/GameTypes";

// Default layouts is what is displayed if the server does not have a set layout in server_config.json.
const DEFAULT_LAYOUTS: Record<
  GameType,
  { type: StatType; w: number; h: number }[] //w and h are width and height for the card (16 total is the max amount displayable)
> = {
  [GAME_TYPE.MINECRAFT]: [
    { type: StatType.STORAGE, w: 1, h: 1 },
    { type: StatType.ENTITY_COUNT, w: 1, h: 1 },
    { type: StatType.UPTIME, w: 1, h: 1 },
    { type: StatType.PLAYER_COUNT, w: 1, h: 1 },
    { type: StatType.TPS, w: 2, h: 1 },
    { type: StatType.STORAGE_THROUGHPUT, w: 2, h: 1 },
    { type: StatType.CPU, w: 2, h: 2 },
    { type: StatType.RAM, w: 2, h: 2 },
  ],
  [GAME_TYPE.DEFAULT]: [
    { type: StatType.UPTIME, w: 1, h: 1 },
    { type: StatType.STORAGE, w: 1, h: 1 },
    { type: StatType.STORAGE_THROUGHPUT, w: 2, h: 1 },
    { type: StatType.CPU, w: 2, h: 2 },
    { type: StatType.RAM, w: 2, h: 2 },
  ],
  [GAME_TYPE.ARK]: [],
  [GAME_TYPE.RUST]: [],
  [GAME_TYPE.VALHEIM]: [],
};

/*
 * The ConfigService is responsible for managing persistent server configuration data by allowing other services to access server_config.json
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, "./server_config.json");

export interface ServerConfig {
  maxPlayerCount: string;
  version: string;
  startTime?: string | null;
  gameType: GameType;
  pendingStatus?: string | null;
  lastActionTime?: number | null;
  layout: { type: string; w: number; h: number }[];
}

export class ConfigService {
  private static ensureDataDir() {
    const dir = path.dirname(DATA_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  public static getFullConfig(): Record<string, ServerConfig> {
    this.ensureDataDir();
    if (!fs.existsSync(DATA_PATH)) return {};
    try {
      return JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
    } catch {
      return {};
    }
  }

  public static getServerConfig(name: string): ServerConfig | null {
    const data = this.getFullConfig();
    return data[name] || null;
  }

  public static updateServer(name: string, updates: Partial<ServerConfig>) {
    const data = this.getFullConfig();

    if (!data[name]) {
      const gameType = updates.gameType || GAME_TYPE.DEFAULT;

      data[name] = {
        version: "Unknown Version",
        maxPlayerCount: "0",
        gameType: gameType,
        layout: this.getDefaultLayout(gameType),
        ...updates,
      } as ServerConfig;
    } else {
      Object.assign(data[name], updates);

      if (updates.gameType && !updates.layout) {
        data[name].layout = this.getDefaultLayout(updates.gameType);
      }
    }

    if (!data[name].layout) {
      data[name].layout = this.getDefaultLayout(data[name].gameType);
    }

    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
  }

  public static getLayout(name: string): {
    layout: { type: string; w: number; h: number }[];
    gameType: GameType;
  } {
    const config = this.getServerConfig(name);
    if (!config) {
      return {
        layout: this.getDefaultLayout(),
        gameType: GAME_TYPE.DEFAULT,
      };
    }

    if (!config.layout || config.layout.length === 0) {
      const defaultLayout = this.getDefaultLayout();
      this.updateServer(name, { layout: defaultLayout });

      return {
        layout: defaultLayout,
        gameType: config.gameType,
      };
    }

    return {
      layout: config.layout,
      gameType: config.gameType,
    };
  }

  private static getDefaultLayout(gameType: GameType = GAME_TYPE.DEFAULT) {
    const layout = DEFAULT_LAYOUTS[gameType];
    if (layout && layout.length > 0) {
      return layout;
    }

    return DEFAULT_LAYOUTS[GAME_TYPE.DEFAULT];
  }

  public static deleteServer(name: string): void {
    const data = this.getFullConfig();

    if (data[name]) {
      delete data[name];
      fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
    }
  }
}
