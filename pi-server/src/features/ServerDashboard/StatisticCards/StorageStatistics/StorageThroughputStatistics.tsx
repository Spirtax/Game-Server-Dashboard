import InnerCard from "@/components/Card/InnerCard";
import "./StorageThroughputStatistics.css";
import LinearGauge from "@/features/ServerDashboard/StatisticCards/LinearGauge/LinearGauge";

interface StorageThroughputStatisticsProps {
  inputData: any;
  outputData: any;
}

export default function StorageThroughputStatistics({
  inputData,
  outputData,
}: StorageThroughputStatisticsProps) {
  const input = inputData?.slice(-1)[0]?.data ?? 0;
  const output = outputData?.slice(-1)[0]?.data ?? 0;
  return (
    <InnerCard
      title={`Disk I/O \u00A0 I: ${input || 0} MB/s \u00A0 O: ${output || 0} MB/s`}
      icon={<i className="bi bi-nvme"></i>}
      description={
        <div className="server-throughput">
          <LinearGauge
            value={input || 0}
            className="top-gauge"
            trackClassName="top-gauge"
            maxValue={0.5}
            width={"256px"}
            height={"12px"}
          />
          <LinearGauge
            value={output || 0}
            className="bottom-gauge"
            trackClassName="bottom-gauge"
            maxValue={5}
            width={"256px"}
            height={"12px"}
          />
        </div>
      }
      width={328}
      colSpan={2}
    />
  );
}
