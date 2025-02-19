import mongoose, { Schema, model } from "mongoose";

const commentSchema = new Schema(
  {
    commentData: {
      type: String,
      required: [true, "Comment data is Required."],
    },
    channel: {
      type: Schema.Types.ObjectId,
      ref: "Channel",
      required: [true, "channel Id is Required."],
    },
    videoId: {
      type: Schema.Types.ObjectId,
      index: true,
      ref: "Video",
      required: [true, "Video Id is Required."],
    }
  },
  { timestamps: true }
);

const Comment = model("Comment", commentSchema);
export default Comment;
