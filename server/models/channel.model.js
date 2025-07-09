import bcrypt from "bcrypt";
import mongoose, { Schema, model } from "mongoose";

const channelSchema = new Schema(
  {
    channelName: {
      type: String,
    },
    email: {
      type: String,
      required: [true, "Email is Required."],
      index: true,
      unique: true,
    },
    password: {
      type: String,
    },
    profilePhoto: {
      type: String,
    },
    bio: {
      type: String,
    },
    permanentPlaylist: {
      type: Map,
      of: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Playlist",
      },
    },
    settings: {
      type: Schema.Types.ObjectId,
      ref: "Setting",
    },
    coverImage: {
      type: String,
    },
    views: {
      type: Number,
      default: 0,
    },
    subscribersCount: {
      type: Number,
      default: 0,
    },
    videosCount: {
      type: Number,
      default: 0,
    },
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
