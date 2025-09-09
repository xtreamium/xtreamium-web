import React from "react";
import { TOKEN_KEY } from "@/constants/storage";
import apiService from "@/services/api.service";
import { StatusCodes } from "http-status-codes";
import { useNavigate } from "react-router-dom";
import type { User } from "@/models/user";

type AuthContextProps = {
  user?: User;
  token: string;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  getUser: () => Promise<User | undefined>;
};

const AuthContext = React.createContext<AuthContextProps>({
  token: "",
  register: async () => {},
  login: async () => {},
  logout: () => {},
  getUser: async () => undefined,
});

type AuthProviderProps = {
  children: React.ReactNode | React.ReactNode[];
};

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = React.useState<User | undefined>(undefined);
  const [token, setToken] = React.useState(
    localStorage.getItem(TOKEN_KEY) || ""
  );
  const register = async (email: string, password: string) => {
    try {
      const response = await apiService.register(email, password);
      if (response.status === StatusCodes.CREATED) {
        setUser(response.data.user);
        setToken(response.data.access_token);
        localStorage.setItem(TOKEN_KEY, response.data.access_token);
        navigate("/dashboard");
        location.reload();
        return;
      }
      throw new Error(response.data);
    } catch (err) {
      console.error(err);
    }
  };
  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login(email, password);
      if (response.status === StatusCodes.OK) {
        setUser(response.data.user);
        setToken(response.data.access_token);
        localStorage.setItem(TOKEN_KEY, response.data.access_token);
        navigate("/dashboard");
        location.reload();
        return;
      }
      throw new Error(response.data);
    } catch (err) {
      console.error(err);
    }
  };
  const logout = () => {
    setUser(undefined);
    setToken("");
    localStorage.removeItem(TOKEN_KEY);
    navigate("/");
    location.reload();
  };
  const getUser = async (): Promise<User | undefined> => {
    try {
      if (token) {
        const user = await apiService.getUser(token);
        setUser(user);
        return user;
      }
    } catch (error) {
      console.error("auth.context", "login", error);
    }
    return undefined;
  };

  return (
    <AuthContext.Provider
      value={{ token, user, register, login, logout, getUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
export { AuthContext };
