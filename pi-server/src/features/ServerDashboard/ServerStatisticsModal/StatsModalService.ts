import axios from "axios";
import * as CONSTANTS from "@/services/ServiceConstants";

/*
 * Fetches the layout of the modal
 */
export const getServerConfig = async (serverName: string) => {
  try {
    const response = await axios.get(
      `${CONSTANTS.API_BASE_URL}/${CONSTANTS.SERVER_URL}/${serverName}/config`,
    );
    return response.data;
  } catch (err) {
    console.error("Config fetch failed", err);
    return null;
  }
};

/*
 * Fetches the dynamic server metrics and resource usage statistics
 */
export const getServerStats = async (serverName: string) => {
  try {
    const response = await axios.get(
      `${CONSTANTS.API_BASE_URL}/${CONSTANTS.SERVER_URL}/${serverName}/stats`,
    );
    return response.data;
  } catch (err) {
    console.error("Stats fetch failed", err);
    return null;
  }
};
