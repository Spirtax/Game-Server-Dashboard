import InnerCard from "@/components/Card/InnerCard";
import "./RamStatistics.css";
import {
  AreaChart,
  AreaSeries,
  ChartTooltip,
  MarkLine,
  TooltipArea,
} from "reaviz";

interface RamStatisticsProps {
  ramData: { id: string; key: Date; data: number }[];
  w?: number;
  h?: number;
}

export default function RamStatistics({
  ramData,
  w = 2,
  h = 2,
}: RamStatisticsProps) {
  const dataLength = ramData.length;

  return (
    <InnerCard
      className="long-card"
      title="RAM %"
      icon={<i className="bi bi-memory"></i>}
      description={
        <AreaChart
          height={96}
          width={312}
          data={ramData.map((item: any, index: number) => ({
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
                        const timeLabel =
                          secondsAgo === 0
                            ? "Just now"
                            : `${secondsAgo} seconds ago`;

                        return `RAM: ${d.value}% ∙ ${timeLabel}`;
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
