import mongoose, { Schema, model } from "mongoose";

const channelSchema = new Schema(
  {
    channelName: {
      type: String,
    },
    email: {
      type: String,
      required: [true, "Email is Required."],
      unique: true,
    },
    password: {
      type: String,
    },
    videos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    profilePhoto: {
      type: String,
    },
    bio: {
      type: String,
    },
    playlist: [
      {
        type: Schema.Types.ObjectId,
        ref: "Playlist",
      },
    ],
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    likedVideos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    settings: {
      type: Schema.Types.ObjectId,
      ref: "Settings",
    },
    videoCount: {
      type: Number,
      default: 0,
    },
    coverImage: {
      type: String,
    },
    views: {
      type: Number,
      default: 0,
    },
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: "Subscription",
      },
    ],
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "Subscription",
      },
    ],
  },
  { timestamps: true }
);

const Channel = model("Channel", channelSchema);
export default Channel;
