import React from "react";
import "./SliderBar.css";

type SliderBarProps = {
  value: string;
  onChange: (val: string) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  snapUnits?: boolean;
};

export default function SliderBar({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = "Units",
  snapUnits = false,
}: SliderBarProps) {
  const handleInputChange = (val: string) => {
    if (val === "") {
      onChange("");
      return;
    }
    onChange(val);
  };

  const handleValidation = () => {
    const numericValue = parseInt(value);

    // We snap to the closest step value here. This is mostly intended for ram slider
    // Some game servers (like Minecraft) are optimized to perform better in powers of 2
    if (snapUnits) {
      const snappedValue = Math.round(parseInt(value) / step) * step;
      onChange(snappedValue.toString());
    }

    if (isNaN(numericValue) || value === "" || numericValue < min) {
      onChange(min.toString());
    } else if (numericValue > max) {
      onChange(max.toString());
    }
  };

  const progress = (Number(value) / max) * 100;

  return (
    <div className="slider-horizontal-container">
      <span className="slider-bound">{min}</span>
      <div className="slider-wrapper">
        <input
          type="range"
          className="slider-line"
          min={min}
          max={max}
          step={step}
          value={value || min}
          style={{ "--progress": `${progress}%` } as React.CSSProperties}
          onChange={(e) => handleInputChange(e.target.value)}
          onMouseUp={handleValidation}
          onKeyUp={handleValidation}
        />
      </div>
      <span className="slider-bound">{max}</span>
      <div className="slider-input-container">
        <input
          type="number"
          className="slider-manual-input"
          value={value}
          onBlur={handleValidation}
          onChange={(e) => handleInputChange(e.target.value)}
        />
        <span className="slider-unit">{unit}</span>
      </div>
    </div>
  );
}
