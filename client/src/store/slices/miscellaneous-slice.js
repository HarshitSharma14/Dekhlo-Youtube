export const createMicellaneousSlice = (set) => ({
    isSidebarOpen: false,
    setIsSidebarOpen: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
})