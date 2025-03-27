import mongoose, { Schema, model } from "mongoose";

const playlistSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    channel: {
      type: Schema.Types.ObjectId,
      ref: "Channel",
      required: [true, "Channel is required"],
    },
    videos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    videosCount: {
      type: Number,
      default: 0,
    },
    private: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Playlist = model("Playlist", playlistSchema);

export default Playlist;
