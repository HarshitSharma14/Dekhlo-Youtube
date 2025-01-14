import Channel from "../models/channel.model.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../utils/constants.js";
import { AsyncTryCatch } from "../middlewares/error.middlewares.js";
import { UploadSinglePhotoToCloudinary } from "../utils/features.js";

// const JWT_SECRET = process.env.JWT_SECRET || "default-secret";
// console.log(JWT_SECRET);

export const getChannelInfo = AsyncTryCatch(async (req, res) => {
  // is is neccessory to logged in to access this come later on this ****************************** <<--
  const token = req.cookies.jwt;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const decoded = jwt.verify(token, JWT_SECRET);
  const channel = await Channel.findById(decoded.channelId);
  res.json(channel);
});

export const updateProfile = AsyncTryCatch(async (req, res, next) => {
  const { channelName, bio, password, profilePhotoUrl } = req.body;
  let profilePhoto = profilePhotoUrl;

  if (req.file) {
    profilePhoto = await UploadSinglePhotoToCloudinary(req);
  }

  const channel = await Channel.findByIdAndUpdate(
    req.channelId,
    {
      channelName,
      bio,
      password,
      profilePhoto,
    },
    { new: true, runValidators: true }
  );
  res
    .status(200)
    .json({ message: "Profile updated successfully", channel: channel });
});
