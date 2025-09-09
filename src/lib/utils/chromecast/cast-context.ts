import { createContext } from "react";
import CastReceiver from "./cast-receiver";

const castContext = createContext<{
  castReceiver?: CastReceiver;
  castSender?: unknown;
  setSession?: (p: unknown) => void;
  session?: unknown;
}>({});

export default castContext;
