import Channel from "../models/channel.model.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../utils/constants.js";
import { AsyncTryCatch } from "../middlewares/error.middlewares.js";
import { UploadSinglePhotoToCloudinary, UploadVideoAndThumbnail } from "../utils/features.js";
import { ErrorHandler } from "../utils/utility.js";
import Video from "../models/video.model.js";

// const JWT_SECRET = process.env.JWT_SECRET || "default-secret";
// console.log(JWT_SECRET);

export const getChannelInfo = AsyncTryCatch(async (req, res) => {
  // is is neccessory to logged in to access this come later on this ****************************** <<--
  const token = req.cookies.jwt;
  console.log(token);
  if (!token) {
    return next(new ErrorHandler(401, "Unnauthorize"));
    return res.status(401).json({ message: "Unauthorized" });
  }
  const decoded = jwt.verify(token, JWT_SECRET);
  const channel = await Channel.findById(decoded.channelId);
  console.log(decoded);
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

export const updateVideo = AsyncTryCatch(async (req, res, next) => {
  console.log("inside")
  const { title, description, channelId, isPrivate, canComment, category } = req.body;
  console.log(channelId)
  console.log(req.files.video)
  console.log(req.files.thumbnail)
  if (!req.files.thumbnail || !req.files.video || !title || !channelId) {
    return next(new ErrorHandler(400, "Please provide all the required fields"));
  }

  console.log("inside2")


  const { videoUrlNew, thumbnailUrlNew } = await UploadVideoAndThumbnail(req);
  console.log("inside3")

  const videonew = await new Video({
    title,
    description,
    videoUrl: videoUrlNew,
    thumbnailUrl: thumbnailUrlNew,
    channel: channelId,
    isPrivate,
    canComment,
    category,
    duration
  })

  console.log("done")

  await videonew.save()

  return res.status(201).json({ message: "Video uploaded successfully", videonew })

})
