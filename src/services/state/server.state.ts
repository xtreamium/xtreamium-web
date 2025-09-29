import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface ServerState {
  selectedServer: string;
  setSelectedServer: (server: string) => void;
}
const useServerStore = create<ServerState>()(
  persist(
    (set) => ({
      selectedServer: "",
      setSelectedServer: (server: string) =>
        set(() => ({ selectedServer: server })),
    }),
    {
      name: "server-state", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);

export default useServerStore;
