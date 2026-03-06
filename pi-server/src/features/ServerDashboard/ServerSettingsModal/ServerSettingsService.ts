import axios from "axios";
import * as CONSTANTS from "@/services/ServiceConstants";

export const deleteServer = async (name: string) => {
  try {
    const response = await axios.post(
      `${CONSTANTS.API_BASE_URL}/${CONSTANTS.SERVICE_URL}/manage/delete`,
      { name },
    );
    return response.data;
  } catch (err: any) {
    return {
      success: false,
      error: err.response?.data?.error || "Failed to initiate deletion",
    };
  }
};
