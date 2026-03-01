import type { CSSProperties, ReactNode } from "react";
import "./Card.css";

type CardProps = {
  children: ReactNode;
  cardContainer?: string;
  className?: string;
  width?: string | number;
  height?: string | number;
  style?: CSSProperties;
};

export default function Card({
  children,
  className = "",
  cardContainer = "",
  width,
  height,
  style = {},
}: CardProps) {
  const styles: CSSProperties = {
    ...style,
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
  };

  return (
    <div className={`card-container ${cardContainer}`} style={styles}>
      <div className={`card-content ${className}`}>{children}</div>
    </div>
  );
}
