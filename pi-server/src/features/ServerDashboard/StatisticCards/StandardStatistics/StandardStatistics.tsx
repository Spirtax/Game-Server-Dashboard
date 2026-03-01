import InnerCard from "@/components/Card/InnerCard";
import "./StandardStatistics.css";

interface StandardStatisticsProps {
  title: string;
  icon: React.ReactNode;
  description: React.ReactNode;
  w: number;
  h: number;
}

export default function StandardStatistics({
  title,
  icon,
  description,
  w,
  h,
}: StandardStatisticsProps) {
  return (
    <InnerCard
      title={title}
      icon={icon}
      description={description}
      rowSpan={h}
      colSpan={w}
    />
  );
}
