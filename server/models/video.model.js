import mongoose from "mongoose";
const { Schema, model, models } = mongoose;
import { videoCategoryEnum } from "../utils/constants.js";

const videoSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Video Title required"],
    },
    category: {
      type: String,
      enum: videoCategoryEnum, required: true
    },
    description: {
      type: String,
    },
    videoUrl: {
      type: String,
      required: [true, "Video url required"],
    },
    thumbnailUrl: {
      type: String,
      default: "", // default thumbnail
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number, //in seconds
      required: true,
    },
    channel: {
      type: Schema.Types.ObjectId,
      ref: "Channel",
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    canComment: {
      type: Boolean,
      default: true,
    },

  },
  { timestamps: true }
);

const Video = model("Video", videoSchema);

export default Video;
