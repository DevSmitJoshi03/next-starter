"use client";

import { createContext, type ReactNode, useContext, useRef } from "react";
import { type StoreApi, useStore as useZustandStore } from "zustand";

/**
 * Wraps a Zustand vanilla store in a React Context so each component tree
 * (and each server request, since Client Components still render once on
 * the server) gets its own store instance instead of sharing one module-level
 * store across users. See https://zustand.docs.pmnd.rs/learn/guides/nextjs
 */
export function createStoreContext<TState, TInit = void>(
  createStoreFn: (init: TInit) => StoreApi<TState>,
) {
  const StoreContext = createContext<StoreApi<TState> | null>(null);

  function StoreProvider({
    init,
    children,
  }: {
    init: TInit;
    children: ReactNode;
  }) {
    const storeRef = useRef<StoreApi<TState> | null>(null);
    storeRef.current ??= createStoreFn(init);

    return (
      <StoreContext.Provider value={storeRef.current}>
        {children}
      </StoreContext.Provider>
    );
  }

  function useBoundStore<T>(selector: (state: TState) => T): T {
    const store = useContext(StoreContext);
    if (!store) {
      throw new Error(
        "Store hook used outside its Provider — wrap the tree with the matching *StoreProvider first.",
      );
    }
    return useZustandStore(store, selector);
  }

  return { StoreProvider, useBoundStore };
}
