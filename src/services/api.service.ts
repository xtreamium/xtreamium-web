import http from "./http.service";
import type { AxiosResponse } from "axios";
import { TOKEN_KEY } from "@/constants/storage";
import { StatusCodes } from "http-status-codes";
import type { User } from "@/models/user";
import type { Server } from "@/models/server";
import type { Category } from "@/models/category";
import type { Stream } from "@/models/stream";
import { EPGListing } from "@/models/epg-listing";
import { logger } from "@/lib/logger";

class ApiService {
  private _getRequestOptions = () => {
    return {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem(TOKEN_KEY),
      },
    };
  };
  public register = async (
    email: string,
    password: string
  ): Promise<AxiosResponse> => {
    const response = await http.post("user/", {
      email: email,
      password: password
    }, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response;
  };
  public login = async (
    email: string,
    password: string
  ): Promise<AxiosResponse> => {
    const params = new URLSearchParams();
    params.append("grant_type", "");
    params.append("username", email);
    params.append("password", password);

    const response = await http.post("user/token", params.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return response;
  };

  public getUser = async (token: string): Promise<User> => {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    };

    const response = await http.get("user/me", requestOptions);
    return response.data as User;
  };

  public getCurrentUser = async (): Promise<User> => {
    const response = await http.get("user/me", this._getRequestOptions());
    return response.data as User;
  };
  public getUserServers = async (): Promise<Server[]> => {
    const response = await http.get("user/servers", this._getRequestOptions());
    return response.data as Server[];
  };

  public getCategories = async (server: Server): Promise<Category[]> => {
    const options = this._getRequestOptions();
    const response = await http.get(`epg/categories`, {
      ...options,
      headers: {
        ...options.headers,
        "x-xtream-server": server.url,
        "x-xtream-username": server.username,
        "x-xtream-password": server.password,
      },
    });
    return response.data;
  };

  public getChannels = async (
    server: Server,
    channelId: string
  ): Promise<Stream[]> => {
    const options = this._getRequestOptions();

    const response = await http.get(`epg/channels/${channelId}`, {
      ...options,
      headers: {
        ...options.headers,
        "x-xtream-server": server.url,
        "x-xtream-username": server.username,
        "x-xtream-password": server.password,
      },
    });
    return response.data as Stream[]; //.filter((r) => r.name === "BBC One FHD");
  };

  public getStreamUrl = (server: Server, streamId: number): string => {
    // Generate stream URL client-side instead of making an API call
    return `${server.url}/live/${server.username}/${server.password}/${streamId}.ts`;
  };

  public async getEPGForChannel(
    server: Server,
    channelId: string
  ): Promise<EPGListing[]> {
    const options = this._getRequestOptions();
    const response = await http.get(
      `epg/listing/${server.id}/${channelId}`,
      {
        ...options,
        headers: {
          ...options.headers,
          "x-xtream-server": server.url,
          "x-xtream-username": server.username,
          "x-xtream-password": server.password,
        },
      }
    );
    return response.data.map((d: unknown) =>
      Object.assign(new EPGListing(), d)
    );
  }

  public async getEPGForChannelsBatch(
    server: Server,
    channelIds: string[]
  ): Promise<Record<string, EPGListing[]>> {
    const options = this._getRequestOptions();
    const response = await http.post(
      `epg/listings/batch?server_id=${server.id}`,
      { channel_ids: channelIds },
      {
        ...options,
        headers: {
          ...options.headers,
          "x-xtream-server": server.url,
          "x-xtream-username": server.username,
          "x-xtream-password": server.password,
        },
      }
    );

    // Convert the response to use EPGListing objects
    const result: Record<string, EPGListing[]> = {};
    for (const [channelId, listings] of Object.entries(response.data)) {
      result[channelId] = (listings as unknown[]).map((d: unknown) =>
        Object.assign(new EPGListing(), d)
      );
    }
    return result;
  }

  public deleteServer = async (serverId: number): Promise<boolean> => {
    const options = this._getRequestOptions();
    const response = await http.delete(`user/server/${serverId}`, options);
    return response.status === StatusCodes.OK;
  };
  public checkUrl = async (url: string): Promise<boolean> => {
    try {
      const options = this._getRequestOptions();
      const response = await http.post("utils/check-url", { url }, options);
      return response.status === StatusCodes.OK && response.data.accessible;
    } catch (error) {
      logger.error("URL check failed", { url, error }, "api.service");
      return false;
    }
  };

  public addServer = async (
    name: string,
    server: string,
    username: string,
    password: string,
    epgUrl: string
  ): Promise<string> => {
    logger.info(
      "Adding server",
      { url: import.meta.env.VITE_API_URL },
      "api.service"
    );
    const options = this._getRequestOptions();
    const response = await http.post(
      "user/server",
      {
        name: name,
        url: server,
        username: username,
        password: password,
        epg_url: epgUrl,
      },
      options
    );

    return response.data["id"];
  };

  public refreshEPG = async (serverId: string): Promise<boolean> => {
    const options = {
      ...this._getRequestOptions(),
      timeout: 120000, // 2 minutes timeout for EPG refresh
    };
    const response = await http.post(
      `epg/refresh?server_id=${serverId}`,
      {},
      options
    );
    return response.status === StatusCodes.OK;
  };

  public getLatestProxyVersion = async (): Promise<string | null> => {
    try {
      const response = await http.get("utils/proxy-version");
      if (response.status === StatusCodes.OK) {
        return response.data.version || response.data;
      }
      return null;
    } catch (error) {
      logger.error("Failed to fetch latest proxy version", { error }, "api.service");
      return null;
    }
  };
}

export default new ApiService();
