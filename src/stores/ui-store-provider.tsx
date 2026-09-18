"use client";

import type { ReactNode } from "react";
import { createStoreContext } from "./create-store-context";
import {
  createUIStore,
  defaultUIState,
  type UIState,
  type UIStore,
} from "./ui-store";

const { StoreProvider, useBoundStore } = createStoreContext<UIStore, UIState>(
  createUIStore,
);

export function UIStoreProvider({
  init = defaultUIState,
  children,
}: {
  init?: UIState;
  children: ReactNode;
}) {
  return <StoreProvider init={init}>{children}</StoreProvider>;
}

/**
 * Select only what you need, e.g. `useUIStore((s) => s.sidebarOpen)`.
 * For multiple fields, wrap the selector in `useShallow` from
 * "zustand/react/shallow" to avoid re-rendering on every store change.
 */
export const useUIStore = useBoundStore;
