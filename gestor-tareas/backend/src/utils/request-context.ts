import { AsyncLocalStorage } from "node:async_hooks";

type Store = {
  userId?: number;
  userEmail?: string;
  userName?: string;
};

const als = new AsyncLocalStorage<Store>();

export const RequestContext = {
  run<T>(fn: () => T, initial: Store = {}) {
    return als.run(initial, fn);
  },

  // -------- SETTERS --------
  setUser(id?: number, email?: string, name?: string) {
    const store = als.getStore();
    if (!store) return;

    store.userId = id;
    store.userEmail = email;
    store.userName = name;
  },

  setUserId(id?: number) {
    const store = als.getStore();
    if (store) store.userId = id;
  },

  setUserEmail(email?: string) {
    const store = als.getStore();
    if (store) store.userEmail = email;
  },

  setUserName(name?: string) {
    const store = als.getStore();
    if (store) store.userName = name;
  },

  // -------- GETTERS --------
  getUserId(): number | undefined {
    return als.getStore()?.userId;
  },

  getUserEmail(): string | undefined {
    return als.getStore()?.userEmail;
  },

  getUserName(): string | undefined {
    return als.getStore()?.userName;
  },
};
