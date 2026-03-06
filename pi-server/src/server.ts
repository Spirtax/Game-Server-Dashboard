import express from "express";
import cors from "cors";
import * as CONSTANTS from "@/services/ServiceConstants";

import manageServerRoutes from "@/routes/Server/manageServerRoutes";

import systemStatsRoutes from "@/routes/System/systemStatsRoutes";
import systemStatusRoutes from "@/routes/System/systemStatusRoutes";

import statsRoutes from "@/routes/Server/serverStatsRoutes";
import fetchServerRoutes from "@/routes/Server/serverListRoutes";
import serverStatesRoutes from "@/routes/Server/serverStateRoutes";

import jobRoutes from "@/routes/jobs/jobRoutes";

const app = express();
app.use(express.json());
app.use(cors());

// Manage server data
app.use(`/${CONSTANTS.SERVICE_URL}`, [manageServerRoutes]);

// Fetch server/container data
app.use(`/${CONSTANTS.SERVER_URL}`, [
  fetchServerRoutes,
  serverStatesRoutes,
  statsRoutes,
]);

// Fetch system data
app.use(`/${CONSTANTS.SYSTEM_URL}`, [systemStatsRoutes, systemStatusRoutes]);

// Fetch job data
app.use(`/${CONSTANTS.JOB_URL}`, [jobRoutes]);

app.listen(CONSTANTS.API_PORT, () =>
  console.log(`API running on port ${CONSTANTS.API_PORT}`),
);
