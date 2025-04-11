import { create, StateCreator } from "zustand";
import { immer } from "zustand/middleware/immer";
import { devtools, persist } from "zustand/middleware";
import createSelectors from "./selectors";

type AuthState = {
    accessToken: string | null;
    user: null;
    setAccessToken: (token: string) => void;
    clearAccessToken: () => void;
};

const createAuthSlice: StateCreator<AuthState> = (set) => ({
    accessToken: null,
    user: null,

    setAccessToken: (token) => set({ accessToken: token }),
    clearAccessToken: () => set({ accessToken: null }),
});

type StoreType = AuthState;

export const useStoreBase = create<StoreType>()(
    devtools(
        persist(
            immer((...a) => ({
                ...createAuthSlice(...a),
            })),
            {
                name: "session-storage", // Tên key trong sessionStorage
                getStorage: () => sessionStorage, // Lưu trữ trong sessionStorage
            }
        )
    )
);

export const useStore = createSelectors(useStoreBase);
