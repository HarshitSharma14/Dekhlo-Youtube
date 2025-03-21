import { AsyncTryCatch } from "../middlewares/error.middlewares.js";
import Channel from "../models/channel.model.js";
import Video from "../models/video.model.js";
import { JWT_SECRET } from "../utils/constants.js";
import { ErrorHandler } from "../utils/utility.js";
import jwt from "jsonwebtoken";
import Comment from "../models/comment.model.js";
// view video *************************************************************
export const getVideo = AsyncTryCatch(async (req, res, next) => {
  console.log("in");

  const { videoId } = req.params;
  console.log(videoId);
  const video = await Video.findByIdAndUpdate(
    videoId,
    { $inc: { views: 1 } },
    { new: true }
  )
    .select("-comments")
    .populate({
      path: "channel", // The field to populate
      select: "channelName profilePhoto subscribersCount views _id  ", // Specify the fields you want
    });
  if (!video) {
    return next(new ErrorHandler(404, "Video not found"));
  }

  await Channel.findByIdAndUpdate(video.channel, { $inc: { views: 1 } });
  let isLiked = false;
  try {
    const token = req.cookies.jwt;
    const decodedData = jwt.verify(token, JWT_SECRET);

    const channel = await Channel.findById(decodedData.channelId).select(
      "watchHistory"
    );

    // Extract the last 10 videos from the array
    const recentVideos = channel.watchHistory.slice(-10);

    // Check if the `videoId` is present in the last 10 entries
    if (recentVideos.some((id) => id.toString() === videoId.toString())) {
      // Find the index of the matched video
      const videoIndex = channel.watchHistory
        .map((id) => id.toString()) // Ensure all IDs are strings
        .lastIndexOf(videoId.toString());

      // Remove the video from its current position
      const [video] = channel.watchHistory.splice(videoIndex, 1);

      // Push the video to the end
      channel.watchHistory.push(video);
    } else {
      // Push the video as a new entry
      channel.watchHistory.push(videoId);
    }
    isLiked = (await Channel.exists({
      _id: decodedData.channelId,
      likedVideos: videoId,
    }))
      ? true
      : false;
    // Save the updated document
    await channel.save();
  } catch (error) {
    console.log("user not logged in to save to watch history");
  }

  console.log(isLiked);

  return res.status(200).json({ video, isLiked, loggedIn: true });
});

export const getComments = AsyncTryCatch(async (req, res, next) => {
  const { videoId } = req.params;
  const { limit = 2, skip = 0 } = req.query; // Default limit is 20, skip is 0

  //console.log("bla bla bla");

  //console.log("skip", skip);

  const video = await Video.findById(videoId);
  if (video.canComment === false)
    return next(new ErrorHandler(400, "Comments are disabled for this video."));

  // Fetch paginated comments
  const comments = await Comment.find({ videoId: videoId })
    .sort({ createdAt: -1 }) // Sort by newest first
    .skip(parseInt(skip)) // Skip the first `skip` comments
    .limit(parseInt(limit)) // Limit to `limit` comments
    .populate("channel", "channelName profilePhoto _id"); // Populate user details

  // Check if there are more comments to load
  const totalComments = await Comment.countDocuments({ videoId: videoId });
  // console.log(totalComments);
  const hasMore = comments.length === parseInt(limit);
  // console.log(comments);
  // console.log(hasMore);
  // console.log("space");

  // Return the comments and pagination info
  return res.status(200).json({
    success: true,
    comments,
    hasMore,
  });
});

export const putComment = AsyncTryCatch(async (req, res, next) => {
  const { videoId } = req.params;
  const { text } = req.body;
  const { channelId } = req;

  console.log("here 1");

  // console.log(channelId)
  // console.log(videoId)

  if (!text) return next(new ErrorHandler(400, "Comment is required"));
  console.log("here 2");

  await Video.findByIdAndUpdate(videoId, { $inc: { commentCount: 1 } });

  const newComment = new Comment({
    commentData: text,
    channel: channelId,
    videoId: videoId,
  });
  await newComment.save();
  console.log("here 3");
  await newComment.populate("channel", "channelName profilePhoto _id");
  console.log("here 4");

  return res.status(201).json({ success: true, comment: newComment });
});

export const likeUnlikeVideo = AsyncTryCatch(async (req, res, next) => {
  const { videoId } = req.params;
  const { isLiked } = req.body;

  console.log("first");

  const video = await Video.findById(videoId);
  // console.log(video)
  if (!video) next(new ErrorHandler(404, "Video not found"));
  console.log("second");

  console.log(isLiked);
  const token = req.cookies.jwt;
  const decodedData = jwt.verify(token, JWT_SECRET);
  const channel = await Channel.findById(decodedData.channelId);

  if (isLiked && !channel.likedVideos.includes(videoId)) {
    console.log("inside true");
    video.likes += 1;
    await video.save();
    channel.likedVideos.push(videoId);
    await channel.save();
    // const channel = await Channel.findByIdAndUpdate(decodedData.channelId, {
    //   $push: { likedVideos: videoId },
    // });

    console.log("third");
    return res.status(200).json({ message: "Video liked", likes: video.likes });
  } else if (!isLiked && channel.likedVideos.includes(videoId)) {
    console.log("forth");
    if (video.likes > 0) {
      video.likes -= 1;
    }
    await video.save();
    channel.likedVideos.pull(videoId);
    await channel.save();
    // const channel = await Channel.findByIdAndUpdate(decodedData.channelId, {
    //   $pull: { likedVideos: videoId },
    // });
    console.log("fifth");
    return res
      .status(200)
      .json({ message: "Video unliked", likes: video.likes });
  } else {
    return res.status(400).json({ message: "Somethings wrong" });
  }
});

export const getVideoDetails = AsyncTryCatch(async (req, res, next) => {
  console.log("inside func");

  const { videoId } = req.params;

  // console.log(videoId)

  const videoDetails = await Video.findById(videoId);

  if (!videoDetails) {
    next(new ErrorHandler(404, "Video not found"));
  }
  console.log(videoDetails);

  return res.status(200).json({ videoDetails });
});

export const getPlayNext = AsyncTryCatch(async (req, res, next) => {
  const { videoId } = req.params;
  const video = await Video.findById(videoId);
  if (!video) {
    return next(new ErrorHandler(404, "Video not found"));
  }

  const videos = await Video.find({ channel: video.channel }).limit(10);

  const playNext = videos.filter((vid) => vid._id.toString() !== videoId);

  return res.status(200).json({ playNext });
});
