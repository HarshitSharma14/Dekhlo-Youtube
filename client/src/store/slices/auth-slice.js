export const createAuthSlice = (set) => ({
    channelInfo: undefined,
    setChannelInfo: (channelInfo) => set({ channelInfo }),
    isLoggedIn: false,
    setIsLoggedIn: (isLoggedIn) => set({ isLoggedIn })

})



