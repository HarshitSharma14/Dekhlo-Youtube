import mongoose, { Schema, model, models } from "mongoose";

const commentSchema = new Schema(
  {
    commentData: {
      type: String,
      required: [true, "Comment data is Required."],
    },
    channelId: {
      type: Schema.Types.ObjectId,
      ref: "Channel",
      required: [true, "channel Id is Required."],
    },
    likeCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Comment = models.Comment || model("Comment", commentSchema);
export default Comment;
