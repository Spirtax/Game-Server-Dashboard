import { Routes, Route, Navigate } from "react-router-dom";
import SideBar from "@/components/SideBar/SideBar";
import ServerDashboard from "./pages/ServerDashboard/ServerDashboard";
import "./App.css";

// Simple placeholder for missing pages
const Placeholder = ({ title }: { title: string }) => (
  <div style={{ padding: "40px", color: "#888" }}>
    <h1>{title}</h1>
    <p>This component is under construction.</p>
  </div>
);

export default function App() {
  return (
    <div className="app-container">
      <SideBar />
      <main className="page-wrapper">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<ServerDashboard />} />
          <Route path="/system" element={<Placeholder title="System Info" />} />
          <Route path="/files" element={<Placeholder title="File Manager" />} />
          <Route
            path="/actions"
            element={<Placeholder title="Global Actions" />}
          />
          <Route path="/backups" element={<Placeholder title="Backups" />} />
          <Route path="/logs" element={<Placeholder title="Error Logs" />} />
          <Route path="/settings" element={<Placeholder title="Settings" />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}
