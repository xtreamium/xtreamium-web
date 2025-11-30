import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  clientPrefix: "VITE_",

  client: {
    VITE_API_URL: z.string().url(),
    VITE_PROXY_URL: z.string().url(),
    VITE_ENABLE_SOCIAL_AUTH: z
      .string()
      .transform((val) => val === "true")
      .default(false),
    VITE_ENABLE_DEV_ICONS: z
      .string()
      .transform((val) => val === "true")
      .default(false),
    VITE_DEFAULT_CLI_ARGS: z.string().optional(),
    VITE_GOOGLE_CLIENT_ID: z.string().optional(),
    VITE_GITHUB_CLIENT_ID: z.string().optional(),
  },

  runtimeEnv: {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_PROXY_URL: import.meta.env.VITE_PROXY_URL,
    VITE_ENABLE_SOCIAL_AUTH: import.meta.env.VITE_ENABLE_SOCIAL_AUTH,
    VITE_ENABLE_DEV_ICONS: import.meta.env.VITE_ENABLE_DEV_ICONS,
    VITE_DEFAULT_CLI_ARGS: import.meta.env.VITE_DEFAULT_CLI_ARGS,
    VITE_GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    VITE_GITHUB_CLIENT_ID: import.meta.env.VITE_GITHUB_CLIENT_ID,
  },

  skipValidation: !!import.meta.env.SKIP_ENV_VALIDATION,
});

// Export DEV flag separately since it's not a VITE_ prefixed variable
export const isDev = import.meta.env.DEV;
