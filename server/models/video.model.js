import mongoose from "mongoose";
const { Schema, model } = mongoose;
import { videoCategoryEnum } from "../utils/constants.js";

const videoSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Video Title required"],
    },
    category: {
      type: String,
      enum: videoCategoryEnum,
      required: true,
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
    channelName: { type: String },
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
    commentCount: {
      type: Number,
      default: 0,
    },
    canComment: {
      type: Boolean,
      default: true,
    },
    embedding: { type: [Number], required: false },
  },
  { timestamps: true }
);

// TODO: discuss the indexs again, as a/c to gpt the _id can also act as createdAt in the sort({_id: -1}) query, as the first 4 bytes of _id is the timeStamp;

// videoSchema.index({ channel: 1, createdAt: -1, _id: -1 });
// videoSchema.index({ channel: 1, createdAt: 1, _id: 1 });

videoSchema.index({ channel: 1, views: -1, _id: -1 });
videoSchema.index({ channel: 1, _id: -1 });
videoSchema.index({ channel: 1, _id: 1 });

const Video = model("Video", videoSchema);

export default Video;
