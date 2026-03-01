import { type CSSProperties, type ReactNode } from "react";
import "./Button.css";

type ButtonProps = {
  width?: string;
  height?: string;
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
};

export default function Button({
  width = "128px",
  height = "32px",
  className = "",
  children,
  onClick,
  disabled = false,
  type = "button",
}: ButtonProps) {
  const style: CSSProperties = {
    width,
    height,
  };

  return (
    <button
      type={type}
      className={`button ${className}`}
      style={style}
      onClick={onClick}
      disabled={disabled}
    >
      {children || "Button"}
    </button>
  );
}
