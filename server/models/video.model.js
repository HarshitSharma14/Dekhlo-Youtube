import mongoose, { Schema, SchemaType, model, models } from "mongoose";

const videoSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Video Title required"],
    },
    description: {
      type: String,
    },
    videoUrl: {
      type: String,
      required: [true, "Video url required"],
    },
    thumbnaiUrl: {
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
      type: Number,
      required: true,
    },
    channel: {
      type: Schema.Types.ObjectId,
      ref: "Channel",
    },
    private: {
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

const Video = models.Video || model("Video", videoSchema);

export default Video;
