import * as CONSTANTS from "@/services/ServiceConstants";

export const fetchSystemStatus = async (): Promise<boolean> => {
  try {
    const response = await fetch(
      `${CONSTANTS.API_BASE_URL}/${CONSTANTS.SYSTEM_URL}/status`,
    );

    if (!response.ok) {
      throw new Error("Failed to fetch system status");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching system status:", error);
    return false;
  }
};
