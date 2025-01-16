import jwt from "jsonwebtoken";
import { AsyncTryCatch } from "../middlewares/error.middlewares.js";
import { JWT_SECRET } from "../utils/constants.js";
import Channel from "../models/channel.model.js";
import Subscription from "../models/subscription.model.js";
import Video from "../models/video.model.js";

export const getVideosForHomePage = AsyncTryCatch(async (req, res, next) => {
  // const v = await Channel.findById("678424c15e73e9479fc1231d")
  //   .populate("following", "creator")                             <<<<<<<<--------------- check it for population
  //   .populate("likedVideos")
  //   .populate("watchHistory");
  // console.log(v.following);
  // res.status(200).json({ v });

  const token = req.cookies.jwt;
  let channelId;
  try {
    channelId = jwt.verify(token, JWT_SECRET);
  } catch (error) {
    channelId = null;
  }
  const { seenIds = [] } = req.body;

  const limit = 20;
  const totalVideoCount = await Video.countDocuments();
  const totalPages = Math.ceil(totalVideoCount / limit) || 0;

  let videosToRecomend = [];
  if (channelId) {
    const user = await Channel.findById(channelId)
      .populate("following", "videos")
      .populate("likedVideos")
      .populate("watchHistory");

    const seenVideoIds = seenIds;

    const followedChannelVideos = await Video.find({
      channel: {
        $in: user.following.map((follow) => follow.creator), // <<<<<<<<<<<<<<<-------------- here too
      } /* check it */,
      _id: {
        $nin: [
          ...user.watchHistory.map((watched) => watched._id),
          ...seenVideoIds,
        ],
      },
    })
      .sort({ views: -1 })
      .limit(limit);

    const likedChannelVideosNotWatched = await Video.find({
      channel: { $in: user.likedVideos.map((video) => video.channel) },
      _id: {
        $nin: [
          ...user.watchHistory.map((watched) => watched._id),
          ...seenVideoIds,
        ],
      },
    })
      .sort({ views: -1 }) // Sort by views (most popular first)
      .limit(limit);

    const personalizedVideos = [
      ...likedChannelVideosNotWatched,
      ...followedChannelVideos,
    ];

    // Remove duplicates by ensuring unique video IDs
    const uniqueVideos = Array.from(
      new Map(personalizedVideos.map((v) => [v._id, v])).values()
    );

    // Sort videos by views and upload date
    uniqueVideos.sort((a, b) => b.likes - a.likes || b.views - a.views);

    // Slice the top videos to return based on the limit
    videosToRecomend = uniqueVideos.slice(0, limit);

    // end of if **************************************
  }

  // If unauthenticated or not enough videos, fetch trending videos
  if (!channelId || videosToRecomend.length < limit) {
    const trendingVideos = await Video.find({
      _id: { $nin: [...videosToRecomend.map((v) => v._id), ...seenVideoIds] }, // Exclude already selected videos
    })
      .sort({ views: -1, uploadDate: -1 })
      .limit(limit - videosToRecomend.length);

    videosToRecomend = [...videosToRecomend, ...trendingVideos];
  }
  res.status(200).json({
    videos: videosToRecomend,
    totalPages,
  });
});
