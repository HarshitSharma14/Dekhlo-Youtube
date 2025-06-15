import mongoose, { Schema, model } from "mongoose";

const playlistSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    channel: {
      type: Schema.Types.ObjectId,
      index: true,
      ref: "Channel",
      required: [true, "Channel is required"],
    },
    videosCount: {
      type: Number,
      default: 0,
    },
    isPrivate: {
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
