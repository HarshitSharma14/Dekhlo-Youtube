import mongoose, { Schema, model } from "mongoose";

const playlistSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    videos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
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
