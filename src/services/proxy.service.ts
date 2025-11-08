import axios, { HttpStatusCode } from "axios";
import { logger } from "@/lib/logger";
import type { Settings } from "@/models/settings";
import { title } from "process";
import { Recording } from "@/models/recording";

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
    title: string,
    channelUrl: string,
    startTime: number,
    endTime: number
  ): Promise<boolean> => {
    const response = await client.post("/recordings", {
      title: title,
      url: channelUrl,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
    });
    logger.debug("proxy.service", "recordShow", response.statusText);
    return response.status === HttpStatusCode.Accepted;
  };

  getRecordings = async (): Promise<Array<Recording>> => {
    const response = await client.get("/recordings");
    if (response.status === HttpStatusCode.Ok) {
      return response.data as Array<Recording>;
    }
    throw new Error("Failed to fetch recordings");
  };

  deleteRecording = async (recordingId: number) => {
    const response = await client.delete(`/recordings/${recordingId}`);
    return response.status === HttpStatusCode.NoContent;
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
