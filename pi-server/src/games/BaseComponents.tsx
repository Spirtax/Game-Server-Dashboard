import { type JSX } from "react";
import CpuStatistics from "@/features/ServerDashboard/StatisticCards/CpuStatistics/CpuStatistics";
import StandardStatistics from "@/features/ServerDashboard/StatisticCards/StandardStatistics/StandardStatistics";
import RamStatistics from "@/features/ServerDashboard/StatisticCards/RamStatistics/RamStatistics";
import StorageThroughputStatistics from "@/features/ServerDashboard/StatisticCards/StorageStatistics/StorageThroughputStatistics";
import { formatUptime } from "@/utils/dateUtils";
import { type GameType } from "@/types/GameTypes";
import { StatType } from "@/types/StatType";
import { ComponentRegistry } from "@/games/ComponentRegistry";
import type {
  GameManifest,
  GameComponentConstructor,
} from "@/types/GameComponent";
import { Dropdown } from "@/components/Metrics/Dropdown/Dropdown";

export class BaseComponents {
  private static getComponentClass(
    gameType: GameType,
  ): GameComponentConstructor | undefined {
    return ComponentRegistry[gameType];
  }

  public static getCreationRequirements(
    gameType: GameType,
    values: Record<string, string>,
    onChange: (key: string, value: string) => void,
  ): JSX.Element | null {
    const ComponentClass = this.getComponentClass(gameType);
    if (!ComponentClass) return null;

    const instance = new ComponentClass();
    return instance.getCreationRequirements(values, onChange);
  }

  public static render(
    gameType: GameType,
    layout: any[],
    stats: any,
  ): JSX.Element[] {
    const ComponentClass = this.getComponentClass(gameType);
    let componentList: (JSX.Element | null)[];

    if (ComponentClass) {
      const instance = new ComponentClass();
      componentList = instance.render(layout, stats);
    } else {
      componentList = layout.map((item) => this.mapBaseStats(item, stats));
    }

    return componentList.filter((c): c is JSX.Element => c !== null);
  }

  public static getManifest(gameType: GameType): GameManifest | undefined {
    const ComponentClass = this.getComponentClass(gameType);
    if (!ComponentClass) return undefined;

    const instance = new ComponentClass();
    return instance.getManifest();
  }

  public static mapBaseStats(item: any, stats: any): JSX.Element | null {
    const type = item.type;
    switch (type) {
      case StatType.CPU:
        return this.createCpu(stats.cpu);
      case StatType.RAM:
        return this.createRam(stats.ram);
      case StatType.STORAGE_THROUGHPUT:
        return this.createStorageThroughput(stats.netIn, stats.netOut);
      case StatType.UPTIME:
        return this.createUptime(stats.startTime);
      case StatType.STORAGE:
        return this.createStandard(
          "World Size",
          stats.diskUsage,
          "bi-hdd-fill",
        );
      default:
        return this.createError();
    }
  }

  public static createDropdown(
    label: string,
    options: string[],
    value: string,
    onChange: (val: string) => void,
  ): JSX.Element {
    return (
      <Dropdown
        label={label}
        options={options}
        value={value}
        onChange={onChange}
      />
    );
  }

  public static createStorageThroughput(
    inputData: number,
    outputData: number,
  ): JSX.Element {
    return (
      <StorageThroughputStatistics
        inputData={inputData}
        outputData={outputData}
      />
    );
  }

  public static createCpu(cpuData: any[], h?: number, w?: number): JSX.Element {
    return <CpuStatistics cpuData={cpuData} h={h || 2} w={w || 2} />;
  }

  public static createRam(ramData: any[], h?: number, w?: number): JSX.Element {
    return <RamStatistics ramData={ramData} h={h || 2} w={w || 2} />;
  }

  public static createUptime(startTime: string): JSX.Element {
    return this.createStandard(
      "Uptime",
      formatUptime(startTime ? new Date(Number(startTime)) : null),
      "bi-clock-fill",
    );
  }

  public static createError(): JSX.Element {
    return this.createStandard("Error", "N/A", "bi-exclamation-triangle");
  }

  public static createStandard(
    title: string,
    value: any,
    icon: string,
    h?: number,
    w?: number,
  ): JSX.Element {
    return (
      <StandardStatistics
        title={title}
        description={value}
        icon={<i className={`bi ${icon}`}></i>}
        w={w || 1}
        h={h || 1}
      />
    );
  }
}
