import jwt from "jsonwebtoken";
import { AsyncTryCatch } from "../middlewares/error.middlewares.js";
import { extractTokenFromRequest, LogedInChannel } from "../utils/utility.js";
import Channel from "../models/channel.model.js";
import Subscription from "../models/subscription.model.js";
import Video from "../models/video.model.js";
import mongoose from "mongoose";
import PlaylistVideos from "../models/playlistVideos.js";

export const getVideosForHomePage = AsyncTryCatch(async (req, res, next) => {
  const { cursor = null, limit = 20 } = req.body;

  const channelId = req.channelId;
  let personalRecommendation = false;
  let lastseenVideo = null;
  if (channelId) {
    const channel = await Channel.findById(channelId);
    if (channel) {
      lastseenVideo = await PlaylistVideos.findOne({
        playlistId: channel.permanentPlaylist.get("watchHistory"),
      })
        .select("_id videoId")
        .populate("videoId", "_id similarVideos")
        .sort({ _id: -1 })
        .limit(1);
      if (lastseenVideo?.videoId) {
        personalRecommendation = true;
      }
    }
  }

  if (!personalRecommendation) {
    const parsedLimit = parseInt(limit);
    const query = {};
    if (cursor) {
      const cursorId = new mongoose.Types.ObjectId(cursor);
      query._id = { $lt: cursorId };
    }

    const videos = await Video.aggregate([
      { $match: query },
      { $sort: { _id: -1 } },
      {
        $lookup: {
          from: "channels",
          foreignField: "_id",
          localField: "channel",
          pipeline: [
            {
              $project: {
                _id: 1,
                channelName: 1,
                profilePhoto: 1,
              },
            },
          ],
          as: "channel",
        },
      },
      { $unwind: "$channel" },
      { $limit: parsedLimit },
    ]);

    const hasMore = videos.length === parsedLimit;
    const nextCursor = hasMore ? videos[videos.length - 1]._id : null;

    return res.status(200).json({ videos, hasMore, nextCursor });
  }

  const similarVideosIds = lastseenVideo.videoId.similarVideos;
  let videosToSend = [];
  let nextCursor = cursor;
  let cnt = limit;
  if (cursor == null || cursor == 0) {
    const video = await Video.findById(lastseenVideo.videoId._id)
      .select("-similarVideos")
      .populate("channel", "_id channelName profilePhoto");
    videosToSend.push(video);
    cnt--;
    nextCursor = 0;
  }

  for (let i = cursor || 0; i < similarVideosIds.length && cnt > 0; i++) {
    const video = await Video.findById(similarVideosIds[i].videoId)
      .select("-similarVideos")
      .populate("channel", "_id channelName profilePhoto");
    if (video) {
      videosToSend.push(video);
      cnt--;
      nextCursor = i + 1;
    }
  }
  const hasMore = nextCursor < similarVideosIds.length;
  res.status(200).json({ videos: videosToSend, hasMore, nextCursor });
});
