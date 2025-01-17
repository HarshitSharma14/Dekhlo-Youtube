import { create } from "zustand";
import { createAuthSlice } from "./slices/auth-slice";
import { createChannelSlice } from "./slices/channel-slice";
import { createMicellaneousSlice } from "./slices/miscellaneous-slice";
export const useAppStore = create()(
    (...a) => ({
        ...createAuthSlice(...a),
        ...createChannelSlice(...a),
        ...createMicellaneousSlice(...a)
    })
) 