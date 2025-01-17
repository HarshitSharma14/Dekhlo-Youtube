import { create } from "zustand";
import { createAuthSlice } from "./slices/auth-slice";
import { createChannelSlice } from "./slices/channel-slice";

export const useAppStore = create()(
    (...a) => ({
        ...createAuthSlice(...a),
        ...createChannelSlice(...a)
    })
) 