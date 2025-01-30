export const createMiscSlice = (set) => ({
  isSidebarOpen: JSON.parse(sessionStorage.getItem("isSidebarOpen")) ?? false,
  activeTabInChannel: -10,

  sidebarActivity: {
    isHome: false,
    isSubscriptionVideos: false,
    isProfile: false,
    isWatchHistory: false,
    isWatchLater: false,
    isPlaylist: false,
    isLikedVideos: false,
    isSubscriptionChannels: false,
    isSettings: false,
  },
  setSidebarActivity: (key) =>
    set((state) => {
      const newSidebarActivity = Object.keys(state.sidebarActivity).reduce(
        (acc, currKey) => ({
          ...acc,
          [currKey]: currKey === key, // Set only the given key to true
        }),
        {}
      );

      // Save the updated state to sessionStorage
      // sessionStorage.setItem(
      //   "sidebarActivity",
      //   JSON.stringify(newSidebarActivity)
      // );

      return { sidebarActivity: newSidebarActivity };
    }),
  toggelSidebar: () =>
    set((state) => {
      const newSidebarState = !state.isSidebarOpen;
      sessionStorage.setItem("isSidebarOpen", JSON.stringify(newSidebarState));
      return { isSidebarOpen: newSidebarState };
    }),
  setActiveTabInChannel: (tab) => set({ tab }),
});
