import axios, { HttpStatusCode } from "axios";
import { logger } from "@/lib/logger";

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
}
export const ProxyService = new InternalProxyService();
