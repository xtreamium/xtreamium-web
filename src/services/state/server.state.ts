import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface ServerState {
  selectedServer: number;
  setSelectedServer: (server: number) => void;
}
const useServerStore = create<ServerState>()(
  persist(
    (set) => ({
      selectedServer: 0,
      setSelectedServer: (server: number) => set(() => ({ selectedServer: server })),
    }),
    {
      name: "server-state", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);

export default useServerStore;
