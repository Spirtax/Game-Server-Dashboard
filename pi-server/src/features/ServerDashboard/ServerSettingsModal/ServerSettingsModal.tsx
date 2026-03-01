import Modal from "@/components/Modal/Modal";
import Button from "@/components/Input/Button/Button";
import InputField from "@/components/Input/InputField/InputField";
import SliderBar from "@/components/Metrics/SliderBar/SliderBar";
import { Settings, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { isValidFileSystemName } from "@/utils/regexUtils";
import "./ServerSettingsModal.css";

type SettingsModalProps = {
  isOpen: boolean;
  setIsModalOpen: () => void;
  name: string;
  loading?: boolean;
  children?: React.ReactNode;
};

export default function SettingsModal({
  isOpen,
  setIsModalOpen,
  name,
  loading = false,
  children,
}: SettingsModalProps) {
  const [settingsName, setSettingsName] = useState(name);
  const [settingsRam, setSettingsRam] = useState("2048");

  useEffect(() => {
    if (isOpen) {
      setSettingsName(name);
      // fetchServerStats() logic would go here to setSettingsRam
    }
  }, [isOpen, name]);

  const handleUpdate = () => {
    // Internal update logic
  };

  const handleDelete = () => {
    // Internal delete logic
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={setIsModalOpen}
      modalSize="w-[684px] h-auto"
    >
      <div className="settings-modal-container">
        <div className="settings-modal-header">
          <div className="header-icon-container flex-center">
            <Settings size={32} />
          </div>
          <div className="header-text">
            <h1>Server Settings</h1>
            <p>Modify configuration for {name}.</p>
          </div>
        </div>

        <hr className="modal-divider" />

        <div className="settings-modal-body">
          <div className="settings-top-row">
            <InputField
              label="Server Name"
              value={settingsName}
              onChange={setSettingsName}
              required
              validate={isValidFileSystemName}
              errorTooltip="No spaces or special characters allowed."
            />

            <div className="slider-container">
              <label className="slider-label">RAM Allocation</label>
              <SliderBar
                value={settingsRam}
                onChange={setSettingsRam}
                min={512}
                max={16384}
                step={256}
                unit="MB"
                snapUnits={true}
              />
            </div>
          </div>

          {children && (
            <div className="game-settings-section">
              <div className="settings-section-title">Game Settings</div>
              <div className="game-specific-settings">{children}</div>
            </div>
          )}
        </div>

        <div className="settings-modal-footer">
          <Button
            className="delete-button"
            onClick={handleDelete}
            width="40px"
            height="36px"
          >
            <Trash2 size={18} />
          </Button>

          <div className="footer-right-actions">
            <Button
              className="cancel-button"
              onClick={setIsModalOpen}
              width="100px"
              height="36px"
            >
              Cancel
            </Button>
            <Button
              className="settings-button-container"
              onClick={handleUpdate}
              disabled={loading || !settingsName}
              width="130px"
              height="36px"
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
