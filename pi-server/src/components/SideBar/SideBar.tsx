import "./SideBar.css";
import {
  LayoutDashboard,
  Activity,
  Files,
  ShieldCheck,
  Terminal,
  Settings,
  Power,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function SideBar() {
  const location = useLocation();

  const navLinks = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard size={24} />,
    },
    {
      name: "System Info",
      path: "/system",
      icon: <Activity size={24} />,
    },
    { name: "File Manager", path: "/files", icon: <Files size={24} /> },
    { name: "Global Actions", path: "/actions", icon: <Power size={24} /> },
    { name: "Backups", path: "/backups", icon: <ShieldCheck size={24} /> },
    { name: "Error Logs", path: "/logs", icon: <Terminal size={24} /> },
    { name: "Settings", path: "/settings", icon: <Settings size={24} /> },
  ];

  return (
    <aside className="sidebar mini">
      <nav className="sidebar-nav flex-center">
        <ul className="nav-list">
          {navLinks.map((link, idx) => {
            const isActive = location.pathname === link.path;

            return (
              <li key={idx} className="nav-item-container">
                <Link
                  key={idx}
                  to={link.path}
                  className={`nav-link flex-center ${isActive ? "active" : ""}`}
                >
                  <span className="nav-icon">{link.icon}</span>
                  <span className="nav-tooltip">{link.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
