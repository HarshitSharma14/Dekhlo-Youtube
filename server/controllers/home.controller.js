import jwt from "jsonwebtoken";
import { AsyncTryCatch } from "../middlewares/error.middlewares.js";
import { JWT_SECRET } from "../utils/constants.js";
import Channel from "../models/channel.model.js";
import Subscription from "../models/subscription.model.js";
import Video from "../models/video.model.js";

export const getVideosForHomePage = AsyncTryCatch(async (req, res, next) => {

  return res.status(200);

  const token = req.cookies.jwt;
  let channelId;
  try {
    const decodedData = jwt.verify(token, JWT_SECRET);
    channelId = decodedData.channelId;
  } catch (error) {
    channelId = null;
  }

  const { seenIds = [] } = req.body;

  const limit = 20;
  let totalVideoCount = 0;
  totalVideoCount = await Video.countDocuments({
    isPrivate: {
      $in: false,
    },
  });
  const seenVideoIds = seenIds;

  let videosToRecomend = [];
  if (channelId) {
    totalVideoCount = await Video.countDocuments({
      channel: {
        $nin: channelId,
      },
      isPrivate: {
        $in: false,
      },
    });

    const user = await Channel.findById(channelId)
      .populate("following", "creator")
      .populate("likedVideos")
      .populate("watchHistory");

    const followedChannelVideosNotWatched = await Video.find({
      channel: {
        $in: [...user.following.map((follow) => follow.creator)],
        $nin: channelId, //          <<<<<<<<<<<<<<<-------------- here too
      },
      _id: {
        $nin: [
          ...user.watchHistory.map((watched) => watched._id),
          ...seenVideoIds,
        ],
      },
      isPrivate: {
        $nin: true,
      },
    })
      .sort({ views: -1 })
      .limit(limit)
      .populate("channel", "channelName profilePhoto")
      .select(
        "title thumbnailUrl _id  duration channel videoUrl views createdAt"
      );


    const likedChannelVideosNotWatched = await Video.find({
      channel: {
        $in: [...user.likedVideos.map((video) => video.channel)],
        $nin: channelId, //          <<<<<<<<<<<<<<<-------------- here too
      },
      _id: {
        $nin: [
          ...user.watchHistory.map((watched) => watched._id),
          ...seenVideoIds,
          ...followedChannelVideosNotWatched.map((vid) => vid._id),
        ],
      },
      isPrivate: {
        $nin: true,
      },
    })
      .sort({ views: -1 }) // Sort by views (most popular first)
      .limit(limit)
      .populate("channel", "channelName profilePhoto")
      .select(
        "title thumbnailUrl _id  duration channel videoUrl views createdAt"
      );

    // console.log("liked channel vids", likedChannelVideosNotWatched);

    const personalizedVideos = [
      ...likedChannelVideosNotWatched,
      ...followedChannelVideosNotWatched,
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
      channel: {
        $nin: channelId,
      },
      _id: { $nin: [...videosToRecomend.map((v) => v._id), ...seenVideoIds] },
      isPrivate: {
        $nin: true,
      },
    })
      .sort({ views: -1, uploadDate: -1 })
      .limit(limit - videosToRecomend.length)
      .populate("channel", "channelName profilePhoto")
      .select(
        "title thumbnailUrl _id  duration channel videoUrl views createdAt"
      );

    // console.log("trending vids", trendingVideos);

    videosToRecomend = [...videosToRecomend, ...trendingVideos];
  }
  const totalPages = Math.ceil(totalVideoCount / limit) || 0;
  // console.log("video to send", videosToRecomend.length);
  res.status(200).json({
    videos: videosToRecomend,
    totalPages,
  });
});
