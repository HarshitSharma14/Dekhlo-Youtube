export const createMicellaneousSlice = (set) => ({
    isSidebarOpen: false,
    setIsSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen: !isSidebarOpen }),
})