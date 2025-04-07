export const createChannelSlice = (set) => ({
    isUploading: undefined,
    setIsUploading: (isUploading) => set({ isUploading }),
    notifications: [],
    setNotifications: (notification) =>
        set((state) => ({ notifications: [notification, ...state.notifications] })),
    clearNotifications: (notifications) => set({ notifications: [] }),
    notificationsPending: false,
    setNotificationsPending: (notificationsPending) => set({ notificationsPending }),



})