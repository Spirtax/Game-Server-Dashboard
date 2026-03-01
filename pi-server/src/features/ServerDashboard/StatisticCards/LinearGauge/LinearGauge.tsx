import { useEffect, useState, type CSSProperties } from "react";
import "./LinearGauge.css";

type LinearGaugeProps = {
  width: string;
  height: string;
  value: number;
  maxValue?: number;
  className?: string;
  trackClassName?: string;
};

export default function LinearGauge({
  className = "",
  trackClassName = "",
  width,
  height,
  value,
  maxValue = 100,
}: LinearGaugeProps) {
  const style: CSSProperties = {
    width,
    height,
  };

  const [gaugeWidth, setGaugeWidth] = useState(0);
  const percent = Math.min(Math.max((value / maxValue) * 100, 0), 100);
  useEffect(() => {
    const timer = setTimeout(() => {
      setGaugeWidth(percent);
    }, 300);

    return () => clearTimeout(timer);
  }, [percent]);

  const fillStyle: CSSProperties = {
    width: `${gaugeWidth}%`,
    background: getGradient(value, maxValue),
    transition: "width 0.6s ease",
    boxShadow: getGlow(value, maxValue),
  };

  return (
    <div className={`gauge-container ${className}`} style={style}>
      <div className={`gauge-track ${trackClassName}`}>
        <div className="gauge-fill" style={fillStyle} />
      </div>
    </div>
  );
}

const getGradient = (value: number, maxValue: number) => {
  if ((value / maxValue) * 100 < 25) {
    return "linear-gradient(90deg, #22c55e 0%, rgb(8, 162, 85) 100%)";
  } else if ((value / maxValue) * 100 < 50) {
    return "linear-gradient(90deg, #fde047 0%, #e7bc11 100%)";
  } else if ((value / maxValue) * 100 < 75) {
    return "linear-gradient(90deg, #fb923c 0%, #df6915 100%)";
  } else {
    return "linear-gradient(90deg, #ef4444 0%, #cb2323 100%)";
  }
};

const getGlow = (value: number, maxValue: number) => {
  if ((value / maxValue) * 100 < 25) return "0 0 10px rgba(34,197,94,0.6)";
  if ((value / maxValue) * 100 < 50) return "0 0 10px rgba(250,204,21,0.6)";
  if ((value / maxValue) * 100 < 75) return "0 0 10px rgba(249,115,22,0.6)";
  return "0 0 10px rgba(239,68,68,0.6)";
};
