import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    open: false,
    allowedHosts: ["streams.dev.fergl.ie", "streams.fergl.ie"],
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
