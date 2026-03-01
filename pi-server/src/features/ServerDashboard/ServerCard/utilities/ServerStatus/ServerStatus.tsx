import "./ServerStatus.css";

export function ServerStatus({ status }: { status: string }) {
  return (
    <div className={`server-status flex-center ${status.toLowerCase()}`}>
      <span className="status-dot"></span>
      <h4 className="status-desc">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </h4>
    </div>
  );
}
