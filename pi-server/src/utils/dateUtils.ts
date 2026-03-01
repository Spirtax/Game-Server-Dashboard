/**
 * Formats the difference between a start Date and now.
 * Logic:
 * - < 1 minute: "<1m"
 * - < 1 hour: "12m"
 * - >= 1 hour: "4h 37m"
 */
export const formatUptime = (startDate: Date | null): string => {
  if (!startDate) return "Offline";

  const now = new Date();
  const diffInMs = now.getTime() - startDate.getTime();

  if (diffInMs <= 0) return "<1m";

  const totalMinutes = Math.floor(diffInMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (totalMinutes < 1) {
    return "<1m";
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
};
