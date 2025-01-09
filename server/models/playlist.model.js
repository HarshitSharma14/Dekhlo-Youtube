import mongoose, { Schema, model, models } from "mongoose";

const playlistSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    numberOfVideos: {
      type: Number,
      default: 0,
    },
    videos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    private: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Playlist = models.Playlist || model("Playlist", playlistSchema);

export default Playlist;
