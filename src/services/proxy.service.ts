import axios, { HttpStatusCode } from "axios";
import { logger } from "@/lib/logger";
import type { Settings } from "@/models/settings";

const client = axios.create({
  baseURL: import.meta.env.VITE_PROXY_URL,
});

class InternalProxyService {
  play = async (channelUrl: string): Promise<boolean> => {
    const response = await client.post(
      `${import.meta.env.VITE_PROXY_URL}/play/${encodeURIComponent(channelUrl)}`
    );

    return response.status === HttpStatusCode.Ok;
  };
  recordShow = async (
    channelUrl: string,
    startTime: number,
    endTime: number
  ): Promise<boolean> => {
    const response = await client.post("/record", {
      url: channelUrl,
      startTime: startTime,
      endTime: endTime,
    });

    logger.debug("proxy.service", "recordShow", response.statusText);
    return response.status === HttpStatusCode.Accepted;
  };

  getSettings = async (): Promise<Settings> => {
    const response = await client.get("/settings");
    if (response.status === HttpStatusCode.Ok) {
      return response.data as Settings;
    }
    throw new Error("Failed to fetch proxy settings");
  };

  saveSettings = async (settings: Settings): Promise<boolean> => {
    const response = await client.post("/settings", settings);
    if (response.status === HttpStatusCode.Ok) {
      return true;
    }
    throw new Error("Failed to save proxy settings");
  };

  getVersion = async (): Promise<string | null> => {
    try {
      const response = await client.get("/version");
      if (response.status === HttpStatusCode.Ok) {
        return response.data.version || response.data;
      }
      return null;
    } catch (error) {
      logger.error("Failed to fetch proxy version", { error }, "proxy.service");
      return null;
    }
  };
}
export const ProxyService = new InternalProxyService();
