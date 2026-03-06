import Modal from "@/components/Modal/Modal";
import Button from "@/components/Input/Button/Button";
import InputField from "@/components/Input/InputField/InputField";
import { AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import "./ConfirmDeleteModal.css";

type ConfirmDeleteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  targetName: string;
};

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  targetName,
}: ConfirmDeleteModalProps) {
  const [confirmInput, setConfirmInput] = useState("");
  const requiredText = `DELETE ${targetName}`;
  const isMatch = confirmInput === requiredText;

  useEffect(() => {
    if (!isOpen) {
      setConfirmInput("");
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} modalSize="w-auto h-auto">
      <div className="confirmation-wrapper">
        <div className="danger-header">
          <div className="danger-icon">
            <AlertTriangle size={32} color="#ef4444" />
          </div>
          <div className="header-text">
            <h1>Delete Server?</h1>
            <p>
              This will permanently remove <strong>{targetName}</strong> and all
              its files.
            </p>
          </div>
        </div>

        <div className="settings-modal-container">
          <p className="confirm-instruction">
            To confirm, type <span className="format-code">{requiredText}</span>
            below:
          </p>
          <InputField
            value={confirmInput}
            onChange={setConfirmInput}
            placeholder={requiredText}
            label=""
          />
          <div className="settings-modal-footer">
            <Button className="cancel-button" onClick={onClose} width="100px">
              Cancel
            </Button>
            <Button
              className={`confirm-delete-button ${isMatch ? "active" : "disabled"}`}
              onClick={onConfirm}
              disabled={!isMatch}
              width="160px"
            >
              Delete Server
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
