import InnerCard from "@/components/Card/InnerCard";
import "./TpsStatistics.css";
import { Meter, MeterColumn } from "reaviz";

interface TpsStatisticsProps {
  tpsData: string;
}

export default function TpsStatistics({ tpsData }: TpsStatisticsProps) {
  return (
    <InnerCard
      title={`TPS: ${tpsData}`}
      icon={<i className="bi bi-speedometer2"></i>}
      description={
        <Meter
          columns={20}
          max={19}
          gap={4}
          value={parseInt(tpsData) - 1}
          style={{ width: 256, height: 12 }}
          column={
            <MeterColumn
              activeFill="rgb(8, 162, 85)"
              inActiveFill="rgb(235, 13, 27)"
              height={20}
            />
          }
        />
      }
      width={328}
      colSpan={2}
    />
  );
}
