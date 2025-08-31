import http from './http.service';
import { Category, EPGListing, Server } from '@/models';
import { Stream } from '@/models';
import axios, { AxiosResponse } from 'axios';
import { User } from '@/models';
import { TOKEN_KEY } from '@/constants/storage';
import { QueryKey } from '@tanstack/react-query';
import { StatusCodes } from 'http-status-codes';

class ApiService {
  private _getRequestOptions = () => {
    return {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem(TOKEN_KEY)
      }
    };
  };
  public login = async (
    email: string,
    password: string
  ): Promise<AxiosResponse> => {
    const params = new URLSearchParams();
    params.append('grant_type', '');
    params.append('username', email);
    params.append('password', password);

    const response = await http.post('/user/token', params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    return response;
  };

  public getUser = async (token: string): Promise<User> => {
    const requestOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      }
    };

    const response = await http.get('/user/me', requestOptions);
    return response.data as User;
  };

  public getCurrentUser = async (): Promise<User> => {
    const response = await http.get('/user/me', this._getRequestOptions());
    return response.data as User;
  };
  public getUserServers = async (): Promise<Server[]> => {
    const response = await http.get('/user/servers', this._getRequestOptions());
    return response.data as Server[];
  };

  public getCategories = async (server: Server): Promise<Category[]> => {
    const options = this._getRequestOptions();
    const response = await http.get(`/epg/categories`, {
      ...options,
      headers: {
        ...options.headers,
        'x-xtream-server': server.url,
        'x-xtream-username': server.username,
        'x-xtream-password': server.password
      }
    });
    return response.data;
  };

  public getChannels = async (
    server: Server,
    categoryId: string
  ): Promise<Stream[]> => {
    const options = this._getRequestOptions();

    const response = await http.get(`/epg/channels/${categoryId}`, {
      ...options,
      headers: {
        ...options.headers,
        'x-xtream-server': server.url,
        'x-xtream-username': server.username,
        'x-xtream-password': server.password
      }
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
        'x-xtream-server': server.url,
        'x-xtream-username': server.username,
        'x-xtream-password': server.password
      }
    });
    if (res.status !== 200) {
      alert('Failed to get stream url');
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
      `${import.meta.env.VITE_API_URL}/epg/listing/${channelId}`,
      {
        ...options,
        headers: {
          ...options.headers,
          'x-xtream-server': server.url,
          'x-xtream-username': server.username,
          'x-xtream-password': server.password
        }
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
  public addServer = async (
    name: string,
    server: string,
    username: string,
    password: string,
    epgUrl: string
  ): Promise<boolean> => {
    console.log('api.service', 'url', import.meta.env.VITE_API_URL);
    const options = this._getRequestOptions();
    const response = await http.post(
      'user/server',
      {
        name: name,
        url: server,
        username: username,
        password: password,
        epg_url: epgUrl
      },
      options
    );

    return response.status === StatusCodes.OK;
  };
}

export default new ApiService();
