import * as CONSTANTS from "@/services/ServiceConstants";

export async function manageServer(name: string, action: string) {
  try {
    const response = await fetch(
      `${CONSTANTS.API_BASE_URL}/${CONSTANTS.SERVER_URL}/${name}/control`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to execute server action");
    }

    const statusResponse = await fetch(
      `${CONSTANTS.API_BASE_URL}/${CONSTANTS.SERVER_URL}/${name}`,
    );
    return await statusResponse.json();
  } catch (error) {
    console.error("Error managing server:", error);
    return null;
  }
}
