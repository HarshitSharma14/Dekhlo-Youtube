import { Schema, model } from "mongoose";

const playlistVideosSchema = new Schema(
    {
        playlistId: {
            type: Schema.Types.ObjectId,
            ref: "Playlist",
            index: true,
            required: true,
        },
        videoId: {
            type: Schema.Types.ObjectId,
            ref: "Video",
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for efficient pagination and sorting
playlistVideosSchema.index({ playListId: 1, createdAt: -1, _id: -1 });

const PlaylistVideos = model("PlaylistVideos", playlistVideosSchema);

export default PlaylistVideos;
