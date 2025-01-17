export const createChannelSlice = (set) => ({
    isUploading: undefined,
    setIsUploading: (isUploading) => set({ isUploading }),

    videoUploadProgress: undefined,
    setVideoUploadProgress: (videoUploadProgress) => set({ videoUploadProgress }),
})