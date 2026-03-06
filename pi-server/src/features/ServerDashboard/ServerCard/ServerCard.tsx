import { useEffect, useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./ServerCard.css";
import type { ServerCardProps, ServerState } from "@/types/ServerCardTypes";

import { ServerControls } from "./utilities/ServerControls/ServerControls";
import StatsModal from "../ServerStatisticsModal/StatsModal";
import ServerSettingsModal from "@/features/ServerDashboard/ServerSettingsModal/ServerSettingsModal";
import Card from "../../../components/Card/Card";

import { Expand } from "@/components/animate-ui/icons/expand";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { ServerStatus } from "./utilities/ServerStatus/ServerStatus";
import GameIcon from "@/components/GameIcon/GameIcon";
import type { GameType } from "@/types/GameTypes";

export default function ServerCard(
  server: ServerCardProps & { onModalToggle: (open: boolean) => void },
) {
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [localStatus, setLocalStatus] = useState<ServerState | null>(null);

  const toggleStatsModal = (state: boolean) => {
    setIsStatsModalOpen(state);
    server.onModalToggle(state);
  };

  const toggleSettingsModal = (state: boolean) => {
    setIsSettingsOpen(state);
    server.onModalToggle(state);
  };

  useEffect(() => {
    setLocalStatus(null);
  }, [server.status]);

  const currentStatus = localStatus || server.status;

  const handleUpdate = (newData: ServerCardProps) => {
    if (newData?.status) {
      setLocalStatus(newData.status);
    }
  };

  const getTitleSize = (name: string) => {
    if (name.length > 20) return "14px";
    if (name.length > 15) return "18px";
    if (name.length > 10) return "22px";
    return "26px";
  };

  return (
    <Card className="server-card" cardContainer="display server-card-container">
      <div className="card-wrapper">
        <div className="card-icon flex-center">
          <GameIcon game={server.gameType as GameType} size={96} />
        </div>
        <div className="card-information">
          <div className="card-header">
            <h1
              className="card-title"
              style={{
                fontSize: getTitleSize(server.name),
              }}
            >
              {server.name}
            </h1>
            <ServerStatus status={currentStatus} />
          </div>
          <div className="player-status">
            <h4 className="player-count">
              <i className="bi bi-people-fill"></i>
              {server.playerCount === "0/0" ? "N/A" : server.playerCount}
            </h4>
          </div>
          <div className="card-version">
            <h4 className="version-header">
              <i className="bi bi-tag-fill"></i>
              {server.version === "Unknown Version" ? "N/A" : server.version}
            </h4>
          </div>
          <ServerControls
            name={server.name}
            currentState={currentStatus}
            onStatusChange={handleUpdate}
            onSettingsClick={() => toggleSettingsModal(true)}
          />
        </div>
        <AnimateIcon animateOnHover>
          <div
            className="button-selector window-controls"
            onClick={() => toggleStatsModal(true)}
          >
            <Expand size={16} />
          </div>
        </AnimateIcon>
      </div>

      <StatsModal
        name={server.name}
        status={currentStatus}
        isOpen={isStatsModalOpen}
        setIsModalOpen={() => toggleStatsModal(false)}
      />

      <ServerSettingsModal
        isOpen={isSettingsOpen}
        setIsModalOpen={() => toggleSettingsModal(false)}
        name={server.name}
      />
    </Card>
  );
}
