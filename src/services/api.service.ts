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
    const params = new URLSearchParams();
    params.append("username", email);
    params.append("password", password);

    const response = await http.post("/user", params.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
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

    const response = await http.post("/user/token", params.toString(), {
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

    const response = await http.get("/user/me", requestOptions);
    return response.data as User;
  };

  public getCurrentUser = async (): Promise<User> => {
    const response = await http.get("/user/me", this._getRequestOptions());
    return response.data as User;
  };
  public getUserServers = async (): Promise<Server[]> => {
    const response = await http.get("/user/servers", this._getRequestOptions());
    return response.data as Server[];
  };

  public getCategories = async (server: Server): Promise<Category[]> => {
    const options = this._getRequestOptions();
    const response = await http.get(`/epg/categories`, {
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

    const response = await http.get(`/epg/channels/${channelId}`, {
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

  public getStreamUrl = async (
    server: Server,
    streamId: number
  ): Promise<string | undefined> => {
    const options = this._getRequestOptions();
    const res = await http.get(`/epg/channel/url/${streamId}`, {
      ...options,
      headers: {
        ...options.headers,
        "x-xtream-server": server.url,
        "x-xtream-username": server.username,
        "x-xtream-password": server.password,
      },
    });
    if (res.status !== 200) {
      alert("Failed to get stream url");
      return;
    }
    return res?.data.url;
  };

  public async getEPGForChannel(
    server: Server,
    channelId: string
  ): Promise<EPGListing[]> {
    const options = this._getRequestOptions();
    const response = await http.get(
      `${import.meta.env.VITE_API_URL}/epg/listing/${server.id}/${channelId}`,
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
  public deleteServer = async (serverId: number): Promise<boolean> => {
    const options = this._getRequestOptions();
    const response = await http.delete(`user/server/${serverId}`, options);
    return response.status === StatusCodes.OK;
  };
  public checkUrl = async (url: string): Promise<boolean> => {
    try {
      await fetch(url, {
        method: "HEAD",
        mode: "no-cors", // Use no-cors to avoid CORS issues when checking external URLs
        cache: "no-cache",
      });
      // For no-cors mode, we can't check the actual response status
      // but if the fetch doesn't throw, the URL is likely accessible
      return true;
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
  ): Promise<boolean> => {
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

    return response.status === StatusCodes.OK;
  };
}

export default new ApiService();
