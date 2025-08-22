export const createAuthSlice = (set) => ({
  channelInfo: null,
  setChannelInfo: (channelInfo) => set({ channelInfo }),
  isLoggedIn: false,
  setIsLoggedIn: (isLoggedIn) => set({ isLoggedIn }),

  // Login/logout actions (token handled via localStorage)
  login: (channelInfo) =>
    set({
      channelInfo,
      isLoggedIn: true,
    }),
  logout: () =>
    set({
      channelInfo: null,
      isLoggedIn: false,
    }),
});
