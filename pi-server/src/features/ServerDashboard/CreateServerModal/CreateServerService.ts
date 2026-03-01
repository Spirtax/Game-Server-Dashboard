import axios from "axios";
import * as CONSTANTS from "@/services/ServiceConstants";
import type { GameType } from "@/types/GameTypes";

export const createServer = async (
  name: string,
  ram: number,
  gameType: GameType,
  gameRequirements: Record<string, string>,
) => {
  try {
    const response = await axios.post(
      `${CONSTANTS.API_BASE_URL}/${CONSTANTS.MANAGE_URL}/create`,
      {
        name,
        ram: ram.toString(),
        gameType,
        gameRequirements,
      },
    );
    return response.data;
  } catch (err: any) {
    return {
      success: false,
      error: err.response?.data?.error || "Failed to connect to server",
    };
  }
};
