import path from "path";

/**
 * Constructs a consistent, Linux-friendly path to a server's docker-compose file.
 */
export const getComposePath = (containerName: string): string => {
  return path
    .join(process.cwd(), "..", "servers", containerName, "docker-compose.yml")
    .replace(/\\/g, "/");
};
