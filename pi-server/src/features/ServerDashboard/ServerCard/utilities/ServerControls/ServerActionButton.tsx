import "./ServerControls.css";
import type { ServerState } from "@/types/ServerCardTypes";

type Props = {
  currentState: ServerState;
  onStart: () => void;
  onStop: () => void;
};

export default function ServerActionButton({
  currentState,
  onStart,
  onStop,
}: Props) {
  const isDisabled =
    currentState === "starting" ||
    currentState === "stopping" ||
    currentState === "restarting";

  const handleClick = () => {
    if (currentState === "offline") onStart();
    if (currentState === "online") onStop();
  };

  const config: Record<
    ServerState,
    { text: string; className: string; icon: React.ReactNode }
  > = {
    offline: {
      text: "Start",
      className: "offline",
      icon: <i className="bi bi-play-fill" />,
    },
    starting: {
      text: "Starting",
      className: "starting",
      icon: <i className="bi bi-pause-fill" />,
    },
    online: {
      text: "Stop",
      className: "online",
      icon: <i className="bi bi-stop-fill" />,
    },
    stopping: {
      text: "Stopping",
      className: "stopping",
      icon: <i className="bi bi-pause-fill" />,
    },
    restarting: {
      text: "Restarting",
      className: "restarting",
      icon: <i className="bi bi-arrow-repeat" />,
    },
  };

  const { text, className, icon } = config[currentState];

  return (
    <button
      className={`server-button ${className} flex-center`}
      disabled={isDisabled}
      onClick={handleClick}
    >
      <span className="icon">{icon}</span>
      <span>{text}</span>
    </button>
  );
}
