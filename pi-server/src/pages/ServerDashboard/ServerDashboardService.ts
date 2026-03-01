import * as CONSTANTS from "@/services/ServiceConstants";
import type { ServerCardProps } from "@/types/ServerCardTypes";

export const fetchServers = async (): Promise<ServerCardProps[]> => {
  try {
    const response = await fetch(
      `${CONSTANTS.API_BASE_URL}/${CONSTANTS.SERVER_URL}/list`,
    );

    if (!response.ok) {
      throw new Error("Failed to fetch server data");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching servers:", error);
    return [];
  }
};
