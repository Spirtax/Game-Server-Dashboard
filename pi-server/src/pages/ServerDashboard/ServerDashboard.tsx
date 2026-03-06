import { useEffect, useState } from "react";
import "./ServerDashboard.css";
import ServerCard from "@/features/ServerDashboard/ServerCard/ServerCard";
import { fetchServers } from "./ServerDashboardService";
import type { ServerCardProps } from "@/types/ServerCardTypes";
import Header from "@/components/Header/Header";
import CreateServerButton from "@/features/ServerDashboard/CreateServerButton/CreateServerButton";
import JobStatusBadge from "@/features/ServerDashboard/JobStatusBadge/JobStatusBadge";

export default function ServerDashboard() {
  const [servers, setServers] = useState<ServerCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const getServers = async () => {
      if (modalOpen) return;
      const data = await fetchServers();
      setServers(data);
      setLoading(false);
    };
    getServers();
    const interval = setInterval(getServers, 5000);
    return () => clearInterval(interval);
  }, [modalOpen]);

  if (loading)
    return <div className="flex-center h-full">Loading Servers...</div>;

  if (servers.length == 0)
    return <div className="flex-center h-full">No servers yet...</div>;

  return (
    <>
      <Header
        pageName="Server Dashboard"
        rightChildren={<CreateServerButton />}
      />
      <JobStatusBadge />
      <div className="server-grid">
        {servers.map((server: ServerCardProps) => (
          <ServerCard
            key={server.id}
            {...server}
            onModalToggle={(isOpen) => setModalOpen(isOpen)}
          />
        ))}
      </div>
    </>
  );
}
