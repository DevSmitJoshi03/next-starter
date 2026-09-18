import { devtools } from "zustand/middleware";
import { createStore } from "zustand/vanilla";

// Example client-only UI store — ephemeral, per-session state that has no
// business being in TanStack Query (which owns all server/async data).
// Replace or extend with real UI state (theme, sidebar, modals, etc).
export type UIState = {
  sidebarOpen: boolean;
};

export type UIActions = {
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
};

export type UIStore = UIState & UIActions;

export const defaultUIState: UIState = {
  sidebarOpen: false,
};

export const createUIStore = (init: UIState = defaultUIState) =>
  createStore<UIStore>()(
    devtools(
      (set) => ({
        ...init,
        toggleSidebar: () =>
          set(
            (state) => ({ sidebarOpen: !state.sidebarOpen }),
            false,
            "toggleSidebar",
          ),
        setSidebarOpen: (open) =>
          set({ sidebarOpen: open }, false, "setSidebarOpen"),
      }),
      { name: "ui-store", enabled: process.env.NODE_ENV === "development" },
    ),
  );
