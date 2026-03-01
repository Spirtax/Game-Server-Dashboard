import type { CSSProperties, ReactNode } from "react";
import Card from "./Card";
import "./InnerCard.css";

type CardProps = {
  title?: string;
  description?: ReactNode;
  icon?: ReactNode;
  cardContainer?: string;
  className?: string;
  width?: string | number;
  height?: string | number;
  colSpan?: number;
  rowSpan?: number;
};

export default function InnerCard({
  title = "",
  description = "",
  icon = "",
  className = "",
  width,
  height,
  colSpan,
  rowSpan,
}: CardProps) {
  const style: CSSProperties = {};
  if (width) style.width = width;
  if (height) style.height = height;
  if (colSpan) style.gridColumn = `span ${colSpan}`;
  if (rowSpan) style.gridRow = `span ${rowSpan}`;

  return (
    <Card
      cardContainer="inner-card"
      className="inner-card-content flex-center"
      width={width}
      height={height}
      style={style}
    >
      <div className={`inner-card-wrapper ${className}`}>
        <div className="inner-card-content">
          <div className="inner-card-title">
            {icon}
            <h4>{title}</h4>
          </div>
          <div className="inner-card-description flex-center">
            {description}
          </div>
        </div>
      </div>
    </Card>
  );
}
