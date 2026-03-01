import "./ServerControls.css";
import { manageServer } from "@/features/ServerDashboard/ServerCard/ServerCardService";
import ServerActionButton from "./ServerActionButton";
import type { ServerState } from "@/types/ServerCardTypes";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { RotateCcw } from "@/components/animate-ui/icons/rotate-ccw";
import { Settings } from "@/components/animate-ui/icons/settings";

type ServerControlsProps = {
  name: string;
  currentState: ServerState;
  onStatusChange: (data: any) => void;
  onSettingsClick: () => void;
};

export function ServerControls({
  name,
  currentState,
  onStatusChange,
  onSettingsClick,
}: ServerControlsProps) {
  const handleAction = async (action: "start" | "stop" | "restart") => {
    const updatedData = await manageServer(name, action);
    if (updatedData) {
      onStatusChange(updatedData);
    }
  };

  return (
    <div className="control-buttons">
      <ServerActionButton
        currentState={currentState}
        onStart={() => handleAction("start")}
        onStop={() => handleAction("stop")}
      />

      {currentState === "online" && (
        <AnimateIcon animateOnHover>
          <RotateCcw
            animation="rotate"
            onClick={() => handleAction("restart")}
          />
        </AnimateIcon>
      )}

      <AnimateIcon animateOnHover>
        <Settings animation="rotate" onClick={onSettingsClick} />
      </AnimateIcon>
    </div>
  );
}
