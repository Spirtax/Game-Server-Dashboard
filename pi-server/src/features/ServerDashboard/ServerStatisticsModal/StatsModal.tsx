import Modal from "@/components/Modal/Modal";
import "./StatsModal.css";
import "../ServerCard/ServerCard.css";
import { useEffect, useState, type JSX } from "react";
import { BaseComponents } from "@/games/BaseComponents";
import { getServerConfig, getServerStats } from "./StatsModalService";
import GameIcon from "@/components/GameIcon/GameIcon";
import { ServerStatus } from "../ServerCard/utilities/ServerStatus/ServerStatus";
import type { GameType } from "@/types/GameTypes";

type StatsModalProps = {
  isOpen: boolean;
  setIsModalOpen: () => void;
  name: string;
  status: string;
};

export default function StatsModal({
  isOpen,
  setIsModalOpen,
  name,
  status,
}: StatsModalProps) {
  if (!setIsModalOpen) return null;

  const [renderedComponents, setRenderedComponents] = useState<JSX.Element[]>(
    [],
  );
  const [config, setConfig] = useState<{
    gameType: string;
    layout: any;
  } | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen) {
      const initializeAndPoll = async () => {
        const serverConfig = await getServerConfig(name);
        if (!serverConfig) return;

        setConfig(serverConfig);

        const fetchStats = async (activeConfig: typeof serverConfig) => {
          const stats = await getServerStats(name);
          if (stats) {
            const ui = BaseComponents.render(
              activeConfig.gameType,
              activeConfig.layout,
              stats,
            );
            setRenderedComponents(ui);
          }
        };

        await fetchStats(serverConfig);
        interval = setInterval(() => fetchStats(serverConfig), 1000);
      };

      initializeAndPoll();
    } else {
      setRenderedComponents([]);
      setConfig(null);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, name]);

  return (
    <Modal isOpen={isOpen} onClose={setIsModalOpen} className="stats-wrapper">
      <div className="stats-container">
        <div className="stats-content">
          <div className="stats-header">
            <div className="stats-title">
              <GameIcon size={36} game={config?.gameType as GameType} />
              <h1>{name}</h1>
              <ServerStatus status={status} />
            </div>
            <hr />
          </div>
        </div>
        <div className="stats-grid">{renderedComponents}</div>
      </div>
    </Modal>
  );
}
