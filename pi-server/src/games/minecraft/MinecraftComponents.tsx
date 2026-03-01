import { type JSX } from "react";
import { BaseComponents } from "../BaseComponents";
import TpsStatistics from "@/features/ServerDashboard/StatisticCards/TpsStatistics/TpsStatistics";
import type { GameComponent, GameManifest } from "@/types/GameComponent";
import manifest from "./manifest.json";
import { StatType } from "@/types/StatType";

export class MinecraftComponents implements GameComponent {
  public getCreationRequirements(
    values: Record<string, string>,
    onChange: (key: string, value: string) => void,
  ): JSX.Element | null {
    return (
      <>
        {BaseComponents.createDropdown(
          "Version",
          manifest.version,
          values.version || manifest.version[0],
          (val) => onChange("version", val),
        )}
        {BaseComponents.createDropdown(
          "Server Type",
          manifest.type,
          values.type || manifest.type[0],
          (val) => onChange("type", val),
        )}
      </>
    );
  }

  public getManifest(): GameManifest {
    return manifest;
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
        case StatType.TPS:
          return <TpsStatistics tpsData={stats.tps} />;
        case StatType.PLAYER_COUNT:
          return BaseComponents.createStandard(
            "Players",
            `${stats.players?.length || 0}/${stats.maxPlayerCount || 0}`,
            "bi-people-fill",
          );
        case StatType.ENTITY_COUNT:
          return BaseComponents.createStandard(
            "Entity Count",
            stats.entityCount,
            "bi-boxes",
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
