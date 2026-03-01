import "./Header.css";
import { Cpu } from "lucide-react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { fetchSystemStatus } from "./HeaderService";

interface HeaderProps {
  pageName: string;
  leftChildren?: ReactNode;
  rightChildren?: ReactNode;
}

export default function Header({
  pageName,
  leftChildren,
  rightChildren,
}: HeaderProps) {
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetchSystemStatus();
        setIsOnline(response);
      } catch (error) {
        setIsOnline(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="main-header">
      <div className="header-left">
        <h1 className="page-title">{pageName}</h1>
        <div className={`status-pill ${isOnline ? "online" : "offline"}`}>
          <Cpu size={16} />
          <span>{isOnline ? "System Online" : "System Offline"}</span>
        </div>
        {leftChildren}
      </div>
      <div className="header-right">{rightChildren}</div>
    </header>
  );
}
