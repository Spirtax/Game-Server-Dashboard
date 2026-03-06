import "dotenv/config";

// Network Constants
const base = process.env.API_BASE_URL || "http://localhost";
export const PORT = process.env.PORT || "3001";
export const API_BASE_URL = `${base}:${PORT}`;

// Route Constants
export const SERVER_URL = "server";
export const SERVICE_URL = "service";
export const SYSTEM_URL = "system";
export const JOB_URL = "jobs";

// Hardware & System Constants
export const CPU_CORES = 4;
export const MAX_HISTORY_IN_SECONDS = 60;
