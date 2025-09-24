// src/utils/request-context.ts
import { AsyncLocalStorage } from "node:async_hooks";

type Store = { userId?: number };

const als = new AsyncLocalStorage<Store>();

export const RequestContext = {
  run<T>(fn: () => T, initial: Store = {}) {
    return als.run(initial, fn);
  },
  setUserId(id?: number) {
    const store = als.getStore();
    if (store) store.userId = id;
  },
  getUserId(): number | undefined {
    return als.getStore()?.userId;
  },
};
