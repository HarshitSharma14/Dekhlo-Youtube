import bcrypt from "bcrypt";
import { Schema, model } from "mongoose";

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
    playlists: [
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

channelSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (update.password) {
    const salt = await bcrypt.genSalt();
    update.password = await bcrypt.hash(update.password, salt);
    this.setUpdate(update);
  }

  // if (!this.isModified("password")) return next();
  // this.password = bcrypt.hash(this.password, salt);
  next();
});

const Channel = model("Channel", channelSchema);
export default Channel;
