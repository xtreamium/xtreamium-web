import axios from "axios";

const getServerFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem("server") || "{}");
  } catch {
    return {};
  }
};

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": "application/json",
  },
});

console.log("http.service", "baseURL configured as:", import.meta.env.VITE_API_URL);

// Add request interceptor to set dynamic headers
instance.interceptors.request.use((config) => {
  const server = getServerFromStorage();
  if (server.server) {
    config.headers["x-xtream-server"] = server.server;
  }
  if (server.username) {
    config.headers["x-xtream-username"] = server.username;
  }
  if (server.password) {
    config.headers["x-xtream-password"] = server.password;
  }
  
  // Debug: log the full URL being requested
  console.log("http.service", "Making request to:", config.baseURL, config.url, "->", 
    config.baseURL ? new URL(config.url || "", config.baseURL).href : config.url);
  
  return config;
});

export default instance;
