import { AsyncTryCatch } from "../middlewares/error.middlewares.js";
import Channel from "../models/channel.model.js";
import Video from "../models/video.model.js";
import { ErrorHandler } from "../utils/utility.js";
import jwt from "jsonwebtoken";

// view video *************************************************************
export const getVideo = AsyncTryCatch(async (req, res, next) => {

  console.log("in")

  const { videoId } = req.params;
  console.log(videoId)
  const video = await Video.findByIdAndUpdate(
    videoId,
    { $inc: { views: 1 } },
    { new: true }
  ).populate("channel");
  if (!video) {
    return next(new ErrorHandler(404, "Video not found"));
  }

  await Channel.findByIdAndUpdate(video.channel, { $inc: { views: 1 } });

  const token = req.cookies.jwt;
  if (!token) return res.status(200).json({ video });

  const decodedData = jwt.verify(token, JWT_SECRET);
  await Channel.findByIdAndUpdate(decodedData.channelId, {
    $push: { watchHistory: videoId },
  });

  return res.status(200).json({ video });
});

// like video ***********************************************************
export const likeUnlikeVideo = AsyncTryCatch(async (req, res, next) => {
  const { videoId } = req.params;
  const video = await Video.findById(videoId);
  if (!video) next(new ErrorHandler(404, "Video not found"));

  const channel = await Channel.findById(req.channelId).populate("likedVideos");

  const likedVideos = channel.likedVideos;

  const isLiked = likedVideos.some(
    (likedVideo) => likedVideo._id.toString() === videoId.toString()
  );

  if (isLiked) {
    video.likes -= 1;
    await video.save();
    await Channel.findByIdAndUpdate(req.channelId, {
      $pull: { likedVideos: videoId },
    });
    return res.status(200).json({ message: "Video unliked" });
  }

  video.likes += 1;
  await video.save();
  await Channel.findByIdAndUpdate(req.channelId, {
    $push: { likedVideos: videoId },
  });
  res.status(200).json({ message: "Video liked" });
});


export const getVideoDetails = AsyncTryCatch(async (req, res, next) => {

  console.log("inside func")

  const { videoId } = req.params;

  // console.log(videoId)

  const videoDetails = await Video.findById(videoId)

  if (!videoDetails) {
    next(new ErrorHandler(404, "Video not found"));
  }
  console.log(videoDetails)

  return res.status(200).json({ videoDetails });
})
