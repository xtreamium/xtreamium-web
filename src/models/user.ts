import type { Server } from "./server";

export interface User {
  id: string;
  email: string;
  servers: Server[];
}
