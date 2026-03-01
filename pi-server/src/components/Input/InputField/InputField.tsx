import { AlertCircle } from "lucide-react";
import "./InputField.css";

type InputFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  validate?: (value: string) => boolean;
  errorTooltip?: string;
  className?: string;
  type?: string;
};

export default function InputField({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  validate,
  errorTooltip = "Invalid input",
  className = "",
  type = "text",
}: InputFieldProps) {
  const isInvalid = value.length > 0 && validate ? !validate(value) : false;

  return (
    <div className={`custom-input-group ${className}`}>
      <label className="custom-input-label">
        {label}
        {required && <span className="custom-input-required">*</span>}
      </label>
      <div className="custom-input-wrapper">
        <input
          type={type}
          className={`custom-input-field ${isInvalid ? "custom-input-error" : ""}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
        {isInvalid && (
          <div className="custom-input-error-icon" data-tooltip={errorTooltip}>
            <AlertCircle size={18} color="#ff4d4d" />
          </div>
        )}
      </div>
    </div>
  );
}
