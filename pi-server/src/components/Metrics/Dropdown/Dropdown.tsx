import { type JSX } from "react";
import "./Dropdown.css";

interface DropdownProps {
  label: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
}

export const Dropdown = ({
  label,
  options,
  value,
  onChange,
}: DropdownProps): JSX.Element => {
  return (
    <div className="dropdown-container">
      <label className="dropdown-label">
        {label}
        <span className="dropdown-required">*</span>
      </label>

      <div className="dropdown-spacer" />

      <select
        className="dropdown-select"
        value={value}
        onFocus={(e) => (e.target.size = 6)}
        onBlur={(e) => (e.target.size = 1)}
        onChange={(e) => {
          onChange(e.target.value);
          e.target.size = 1;
          e.target.blur();
        }}
      >
        {!value && (
          <option value="" disabled>
            Choose category
          </option>
        )}

        {options.map((opt) => (
          <option key={opt} value={opt} className="dropdown-option">
            {opt.charAt(0).toUpperCase() + opt.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
};
