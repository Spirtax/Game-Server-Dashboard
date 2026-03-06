import { useState } from "react";
import Modal from "@/components/Modal/Modal";
import ErrorModal from "@/components/Modal/ErrorModal";
import Button from "@/components/Input/Button/Button";
import "./CreateServerModal.css";
import { createServer } from "./CreateServerService";
import { type GameType, GAME_TYPE, GAME_TYPES } from "@/types/GameTypes";
import { Server } from "lucide-react";
import SliderBar from "@/components/Metrics/SliderBar/SliderBar";
import { BaseComponents } from "@/games/BaseComponents";
import { isValidFileSystemName } from "@/utils/regexUtils";
import { Dropdown } from "@/components/Metrics/Dropdown/Dropdown";
import InputField from "@/components/Input/InputField/InputField";

type CreateServerModalProps = {
  isOpen: boolean;
  setIsModalOpen: () => void;
};

export default function CreateServerModal({
  isOpen,
  setIsModalOpen,
}: CreateServerModalProps) {
  const [loading, setLoading] = useState(false);
  const [serverName, setServerName] = useState("");
  const [ramAmount, setRamAmount] = useState("2048");
  const [selectedGame, setSelectedGame] = useState<GameType>(
    GAME_TYPE.MINECRAFT,
  );
  const [gameRequirements, setGameRequirements] = useState<
    Record<string, string>
  >({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isInvalid = serverName.length > 0 && !isValidFileSystemName(serverName);

  const handleGameTypeChange = (game: GameType) => {
    setSelectedGame(game);
    setGameRequirements({});
  };

  const handleRequirementChange = (key: string, value: string) => {
    setGameRequirements((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleCreate = async () => {
    if (isInvalid) return;

    const manifest = BaseComponents.getManifest(selectedGame);
    const finalRequirements: Record<string, string> = { ...gameRequirements };

    if (manifest) {
      Object.entries(manifest).forEach(([key, value]) => {
        const singularKey = key.endsWith("s") ? key.slice(0, -1) : key;
        const isAlreadySet =
          finalRequirements[key] || finalRequirements[singularKey];

        if (Array.isArray(value) && value.length > 0 && !isAlreadySet) {
          finalRequirements[key] = value[0];
        }
      });
    }

    setLoading(true);
    try {
      const result = await createServer(
        serverName,
        parseInt(ramAmount),
        selectedGame,
        finalRequirements,
      );

      setIsModalOpen();
      if (result.success) {
        setServerName("");
      } else {
        setErrorMessage(result.error || "Failed to create server.");
      }
    } catch (err: any) {
      setErrorMessage("A network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ErrorModal
        isOpen={!!errorMessage}
        onClose={() => setErrorMessage(null)}
        title="Server Creation Failed"
        error={errorMessage}
      />

      <Modal isOpen={isOpen} onClose={setIsModalOpen} modalSize="w-auto h-auto">
        <div className="create-modal-container">
          <div className="create-modal-header">
            <div className="header-icon-container flex-center">
              <Server size={32} />
            </div>
            <div className="header-text">
              <h1>Create New Server</h1>
              <p>Configure your instance and resource allocation.</p>
            </div>
          </div>

          <hr className="modal-divider" />

          <div className="create-modal-body">
            <div className="input-group span-1">
              <InputField
                label="Server Name"
                value={serverName}
                onChange={setServerName}
                placeholder="Server Name"
                required
                validate={isValidFileSystemName}
                errorTooltip="No spaces or special characters allowed."
                className="span-1"
              />
            </div>

            <div className="input-group span-1">
              <Dropdown
                label="Game Type"
                value={selectedGame}
                onChange={(val) => handleGameTypeChange(val as GameType)}
                options={GAME_TYPES.filter(
                  (type) => type !== GAME_TYPE.DEFAULT,
                )}
              />
            </div>

            {BaseComponents.getCreationRequirements(
              selectedGame,
              gameRequirements,
              handleRequirementChange,
            )}

            <div className="input-group span-2">
              <div className="ram-input">
                <label>
                  RAM Allocation<span className="required">*</span>
                </label>
                <SliderBar
                  value={ramAmount}
                  onChange={setRamAmount}
                  min={512}
                  max={16384}
                  step={256}
                  unit="MB"
                  snapUnits={true}
                />
              </div>
            </div>
          </div>

          <div className="create-modal-footer flex-center">
            <Button
              className="cancel-button"
              onClick={setIsModalOpen}
              width="100px"
              height="36px"
            >
              Cancel
            </Button>
            <Button
              className="create-button-container"
              onClick={handleCreate}
              disabled={loading || !serverName || !selectedGame || isInvalid}
              width="120px"
              height="36px"
            >
              {loading ? "Creating..." : "Create Server"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
