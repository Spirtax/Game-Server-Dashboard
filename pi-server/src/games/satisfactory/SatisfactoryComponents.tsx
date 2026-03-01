import { type JSX } from "react";
import { BaseComponents } from "../BaseComponents";
import type { GameComponent, GameManifest } from "@/types/GameComponent";
import manifest from "./manifest.json";
import { StatType } from "@/types/StatType";

export class SatisfactoryComponents implements GameComponent {
  public getManifest(): GameManifest {
    return {};
  }

  public getCreationRequirements(
    values: Record<string, string>,
    onChange: (key: string, value: string) => void,
  ): JSX.Element | null {
    return null;
  }

  public render(layout: any[], stats: any): (JSX.Element | null)[] {
    return layout.map((item) => {
      switch (item.type) {
        case StatType.CPU:
          return BaseComponents.createCpu(stats.cpu);
        case StatType.RAM:
          return BaseComponents.createRam(stats.ram);
        case StatType.STORAGE_THROUGHPUT:
          return BaseComponents.createStorageThroughput(
            stats.netIn,
            stats.netOut,
          );
        case StatType.PLAYER_COUNT:
          return BaseComponents.createStandard(
            "Pioneers",
            `${stats.players?.online || 0}/${stats.players?.max || 4}`,
            "bi-person-badge-fill",
          );
        case StatType.UPTIME:
          return BaseComponents.createUptime(stats.startTime);
        case StatType.STORAGE:
          return BaseComponents.createStandard(
            "World Size",
            stats.diskUsage,
            "bi-hdd-fill",
          );
        default:
          return BaseComponents.createError();
      }
    });
  }
}
