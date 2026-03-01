import InnerCard from "@/components/Card/InnerCard";
import "./CpuStatistics.css";
import {
  AreaChart,
  AreaSeries,
  ChartTooltip,
  MarkLine,
  TooltipArea,
} from "reaviz";

interface CpuStatisticsProps {
  cpuData: { id: string; key: Date; data: number }[];
  w?: number;
  h?: number;
}

export default function CpuStatistics({
  cpuData,
  w = 2,
  h = 2,
}: CpuStatisticsProps) {
  const dataLength = cpuData.length;
  return (
    <InnerCard
      className="long-card"
      title="CPU %"
      icon={<i className="bi bi-cpu"></i>}
      description={
        <AreaChart
          height={96}
          width={312}
          data={cpuData.map((item: any, index: number) => ({
            ...item,
            id: index,
            key: new Date(item.key),
          }))}
          series={
            <AreaSeries
              interpolation="smooth"
              markLine={<MarkLine strokeWidth={0} />}
              tooltip={
                <TooltipArea
                  placement="right"
                  tooltip={
                    <ChartTooltip
                      content={(d: any) => {
                        const secondsAgo = dataLength - d.id - 1;
                        return `CPU: ${d.value}% ∙ ${secondsAgo === 0 ? "Just now" : `${secondsAgo} seconds ago`}`;
                      }}
                    />
                  }
                />
              }
            />
          }
        />
      }
      width={328}
      height={144}
      rowSpan={h}
      colSpan={w}
    />
  );
}
