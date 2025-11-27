import axios, { HttpStatusCode } from "axios";
import { logger } from "@/lib/logger";
import type { Settings } from "@/models/settings";
import { title } from "process";
import { Recording } from "@/models/recording";
import { LogsResponse } from "@/models/log-entry";
import { DirectoryListing } from "@/models/directory-listing";

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

  deleteRecording = async (recordingId: number): Promise<boolean> => {
    const response = await client.delete(`/recordings/${recordingId}`);
    return (
      response.status === HttpStatusCode.NoContent ||
      response.status === HttpStatusCode.Ok
    );
  };

  openRecordingsFolder = async (): Promise<boolean> => {
    try {
      const response = await client.post("/recordings/open-folder");
      return response.status === HttpStatusCode.Ok;
    } catch {
      return false;
    }
  };

  findRecordingByShow = async (
    channelUrl: string,
    startTime: number
  ): Promise<Recording | null> => {
    try {
      const recordings = await this.getRecordings();
      return (
        recordings.find(
          (r) =>
            r.url === channelUrl &&
            new Date(r.startTime).getTime() === startTime &&
            !r.isRecorded
        ) || null
      );
    } catch {
      return null;
    }
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

  getLogs = async (
    limit?: number,
    level?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<LogsResponse> => {
    const params = new URLSearchParams();
    if (limit) params.append("limit", limit.toString());
    if (level) params.append("level", level);
    if (startDate) params.append("startDate", startDate.toISOString());
    if (endDate) params.append("endDate", endDate.toISOString());

    const response = await client.get(`/logs?${params.toString()}`);
    if (response.status === HttpStatusCode.Ok) {
      return response.data as LogsResponse;
    }
    throw new Error("Failed to fetch logs");
  };

  uploadLogsToPastebin = async (): Promise<string> => {
    const response = await client.post("/logs/upload");
    if (response.status === HttpStatusCode.Ok) {
      return response.data.url as string;
    }
    throw new Error("Failed to upload logs to pastebin");
  };

  listDirectory = async (path?: string): Promise<DirectoryListing> => {
    const response = await client.get("/browse", {
      params: path ? { path } : undefined,
    });
    if (response.status === HttpStatusCode.Ok) {
      return response.data as DirectoryListing;
    }
    throw new Error("Failed to list directory");
  };
}
export const ProxyService = new InternalProxyService();
