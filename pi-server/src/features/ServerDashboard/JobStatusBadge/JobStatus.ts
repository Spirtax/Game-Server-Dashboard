import axios from "axios";
import * as CONSTANTS from "@/services/ServiceConstants";

export const fetchJobs = async (setJobs: (jobs: any[]) => void) => {
  try {
    const response = await axios.get(
      `${CONSTANTS.API_BASE_URL}/${CONSTANTS.JOB_URL}`,
    );

    if (response.status === 200) {
      setJobs(response.data.jobs || []);
    }
  } catch (error: any) {
    console.error("Failed to fetch jobs:", error.message);
  }
};

export const dismissJob = async (
  id: string,
  setDismissedIds: React.Dispatch<React.SetStateAction<string[]>>,
) => {
  try {
    await axios.delete(`${CONSTANTS.API_BASE_URL}/${CONSTANTS.JOB_URL}/${id}`);
    setDismissedIds((prev) => [...prev, id]);
  } catch (error) {
    console.error("Failed to delete job:", error);
  }
};
