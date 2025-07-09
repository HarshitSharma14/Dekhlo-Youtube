import { AsyncTryCatch } from "../middlewares/error.middlewares.js";
import Channel from "../models/channel.model.js";
import Video from "../models/video.model.js";
import { JWT_SECRET } from "../utils/constants.js";
import { ErrorHandler, LogedInChannel } from "../utils/utility.js";
import jwt from "jsonwebtoken";
import Comment from "../models/comment.model.js";
import Subscription from "../models/subscription.model.js";
import mongoose, { isValidObjectId, Types } from "mongoose";
import Notification from "../models/notification.model.js";
import { emitNotification } from "../socket.js";
import Setting from "../models/setting.model.js";
import PlaylistVideos from "../models/playlistVideos.js";
import {
  deleteImageFromCloudinary,
  deleteVideoFromCloudinary,
} from "../utils/features.js";
import Playlist from "../models/playlist.model.js";

// view video *************************************************************
export const getVideo = AsyncTryCatch(async (req, res, next) => {
  const { videoId } = req.params;

  const video = await Video.findByIdAndUpdate(
    videoId,
    { $inc: { views: 1 } },
    { new: true }
  ).populate({
    path: "channel", // The field to populate
    select: "channelName profilePhoto subscribersCount views _id  ", // Specify the fields you want
  });

  if (!video) {
    return next(new ErrorHandler(404, "Video not found"));
  }

  await Channel.findByIdAndUpdate(video.channel, { $inc: { views: 1 } });

  let isLiked = false;

  const channelIdVisiting = LogedInChannel(req.cookies?.jwt);

  if (channelIdVisiting) {
    const channelVisiting = await Channel.findById(channelIdVisiting).populate(
      "settings"
    );

    if (channelVisiting.settings.watchHistoryOn) {
      const watchHistoryPlaylistId =
        channelVisiting.permanentPlaylist.get("watchHistory");

      const result = await PlaylistVideos.deleteOne({
        playlistId: watchHistoryPlaylistId,
        videoId: videoId,
      });

      const newPlaylistVideo = new PlaylistVideos({
        playlistId: watchHistoryPlaylistId,
        videoId: videoId,
      });

      await newPlaylistVideo.save();
      await Playlist.findByIdAndUpdate(watchHistoryPlaylistId, {
        $inc: { videosCount: !result.deletedCount },
      });
    }
    // Check if the video is liked by the visiting channel
    const likedVideoPlaylistId = channelVisiting.permanentPlaylist.likedVideos;

    isLiked = !!(await PlaylistVideos.find({
      playlistId: likedVideoPlaylistId,
      videoId: videoId,
    }));
  }

  return res.status(200).json({
    video,
    isLiked,
    isSubscribed: false,
    isBell: false,
  });
});

//✅ get comments of a video ******************************************************
export const getComments = AsyncTryCatch(async (req, res, next) => {
  const { videoId } = req.params;
  const { limit = 20, cursor = null } = req.query; // Default limit is 20, skip is

  const video = await Video.findById(videoId);
  if (video.canComment === false)
    return next(new ErrorHandler(400, "Comments are disabled for this video."));

  const matchQuery = { videoId };
  if (cursor && isValidObjectId(cursor)) {
    matchQuery._id = { $gt: new Types.ObjectId(cursor) };
  }

  const comments = await Comment.aggregate([
    { $match: matchQuery },
    { $sort: { _id: -1 } },
    { $limit: parseInt(limit) },
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
    {
      $unwind: "$channel",
    },
  ]);

  const hasMore = comments.length === limit;
  const nextCursor = hasMore ? comments[comments.length - 1]._id : null;

  return res.status(200).json({
    success: true,
    comments,
    hasMore,
    nextCursor,
  });
});

//✅ get watch next video side alliey ******************************************************
export const getWatchNext = AsyncTryCatch(async (req, res, next) => {
  const { videoId } = req.params;
  const cursor = req.query.cursor;
  const limit = 3;
  const video = await Video.findById(videoId);
  if (!video) {
    return next(new ErrorHandler(404, "Video not found"));
  }

  let query = {
    channel: new mongoose.Types.ObjectId(video.channel),
    _id: { $ne: new mongoose.Types.ObjectId(videoId) },
  };

  if (cursor) {
    query._id = {
      $gt: new mongoose.Types.ObjectId(cursor),
      $ne: new mongoose.Types.ObjectId(videoId),
    };
  }

  const watchNext = await Video.aggregate([
    { $match: query },
    { $limit: limit },
    {
      $lookup: {
        from: "channels",
        foreignField: "_id",
        localField: "channel",
        pipeline: [{ $project: { _id: 1, profilePhoto: 1, channelName: 1 } }],
        as: "channel",
      },
    },
    { $unwind: "$channel" },
  ]);

  return res.status(200).json({ watchNext });
});

export const putComment = AsyncTryCatch(async (req, res, next) => {
  const { videoId } = req.params;
  const { text } = req.body;
  const { channelId } = req;

  if (!text) return next(new ErrorHandler(400, "Comment is required"));

  const newComment = new Comment({
    commentData: text,
    channel: channelId,
    videoId: videoId,
  });
  await newComment.save();

  await Video.findByIdAndUpdate(videoId, { $inc: { commentCount: 1 } });

  await newComment.populate("channel", "channelName profilePhoto _id settings");

  const settings = await Setting.findById(newComment.channel.settings);

  if (settings.commentNotification === false) {
    return res.status(201).json({ success: true, comment: newComment });
  }

  const video = await Video.findById(videoId).select("channel title");

  const notification = new Notification({
    channel: video.channel,
    message: `<span style="color: #1DA1F2; font-weight: bold;">${newComment.channel.channelName}</span> 
              commented on your video:
              <span style="color: #FFD700; font-weight: bold;">${video.title}</span><br />
              <i>"${text}"</i>`,
    isRead: false,
  });

  await notification.save();

  emitNotification(video.channel.toString(), {
    message: notification.message,
    channel: notification.channel,
    isRead: false,
    createdAt: notification.createdAt,
  });

  return res.status(201).json({ success: true, comment: newComment });
});

export const likeUnlikeVideo = AsyncTryCatch(async (req, res, next) => {
  const { videoId } = req.params;
  const { isLiked } = req.body;

  const video = await Video.findById(videoId);

  if (!video) next(new ErrorHandler(404, "Video not found"));

  const channelId = req.channelId;

  const channel = await Channel.findById(channelId).select("permanentPlaylist");
  const likedVideosPlaylistId = channel.permanentPlaylist.likedVideos;

  const videoToggle = await PlaylistVideos.find({
    playlistId: likedVideosPlaylistId,
    videoId: videoId,
  });

  if (videoToggle) {
    await videoToggle.deleteOne();
    await Video.findByIdAndUpdate(videoId, { $inc: { likes: -1 } });
    return res
      .status(200)
      .json({ message: "Video unliked", likes: video.likes });
  } else {
    const playlistVideo = new PlaylistVideos({
      playlistId: likedVideosPlaylistId,
      videoId: videoId,
    });
    await playlistVideo.save();

    const notification = new Notification({
      channel: video.channel,
      message: `<span style="color: #1DA1F2; font-weight: bold;">${channel.channelName}</span> 
              has liked your video: 
              <span style="color: #FFD700; font-weight: bold;">${video.title}</span>`,
      isRead: false,
    });

    await notification.save();
    console.log("liking");
    console.log(video.channel);
    emitNotification(video.channel.toString(), {
      message: notification.message,
      channel: video.channel,
      isRead: false,
      createdAt: notification.createdAt,
    });
    await Video.findByIdAndUpdate(videoId, { $inc: { likes: 1 } });
  }
  return res.status(200).json({ message: "success" });
});

// ✅ get video details ********************************************************************************
export const getVideoDetails = AsyncTryCatch(async (req, res, next) => {
  const { videoId } = req.params;

  const videoDetails = await Video.findById(videoId);

  if (!videoDetails) {
    next(new ErrorHandler(404, "Video not found"));
  }
  return res.status(200).json({ videoDetails });
});

export const searchVideo = AsyncTryCatch(async (req, res, next) => {
  const { searchText } = req.query;
  const cursor = req.query?.cursor;
  const limit = 10;

  const results = await Video.aggregate([
    {
      $search: {
        // 🔥 Atlas Search with Fuzzy Matching
        index: "search",
        compound: {
          should: [
            {
              // ✅ High weight for channel name
              text: {
                query: searchText,
                path: "channelName",
                fuzzy: { maxEdits: 2 },
                score: { boost: { value: 3 } },
              },
            },
            {
              // ✅ Medium weight for title and category
              text: {
                query: searchText,
                path: ["title", "category"],
                fuzzy: { maxEdits: 2 },
                score: { boost: { value: 10 } },
              },
            },
            {
              // ✅ Low weight for description
              text: {
                query: searchText,
                path: ["description"],
                fuzzy: { maxEdits: 2 },
                score: { boost: { value: 2 } },
              },
            },
          ],
          minimumShouldMatch: 1,
        },
      },
    },
    // ✅ Cursor filter applied early for efficiency
    ...(cursor
      ? [{ $match: { _id: { $gt: new mongoose.Types.ObjectId(cursor) } } }]
      : []),
    {
      $lookup: {
        from: "channels", // ✅ Correct collection name
        localField: "channel", // ✅ Reference field in `videos`
        foreignField: "_id", // ✅ `_id` field in `channels`
        as: "channel",
      },
    },
    {
      $unwind: {
        path: "$channel",
        preserveNullAndEmptyArrays: true, // ✅ Avoid breaking if no match is found
      },
    },
    {
      $addFields: {
        // ✅ Add relevance score
        searchScore: { $meta: "searchScore" },
      },
    },
    {
      $facet: {
        // ✅ Parallel pipelines
        metadata: [
          {
            $group: {
              // ✅ Min/Max values for normalization
              _id: null,
              maxViews: { $max: "$views" },
              minViews: { $min: "$views" },
              maxScore: { $max: "$searchScore" },
              minScore: { $min: "$searchScore" },
            },
          },
        ],
        results: [
          { $limit: 50 }, // ✅ Fetch initial batch
        ],
      },
    },
    { $unwind: "$metadata" },
    { $unwind: "$results" },

    // ✅ Deduplicate by grouping on _id
    {
      $group: {
        _id: "$results._id",
        doc: { $first: "$results" }, // Keep only one instance
        combinedScore: { $first: "$combinedScore" },
      },
    },

    // ✅ Flatten the grouped structure
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: ["$doc", { combinedScore: "$combinedScore" }],
        },
      },
    },

    // ✅ Sort by combined score
    { $sort: { combinedScore: -1, _id: 1 } },

    // ✅ Limit results
    { $limit: limit },
  ]);

  return res.status(200).json({ results });
});

export const autoComplete = AsyncTryCatch(async (req, res, next) => {
  const { searchText } = req.query;
  // console.log("AutoComplete Query:", searchText);

  // 🔥 Separate Search for Title
  const titleResults = await Video.aggregate([
    {
      $search: {
        index: "autocomplete",
        autocomplete: {
          query: searchText,
          path: "title",
          fuzzy: { maxEdits: 2, prefixLength: 1 },
        },
      },
    },
    { $addFields: { searchScore: { $meta: "searchScore" } } },
    { $match: { searchScore: { $gte: 2 } } }, // ✅ Threshold Filter
    { $project: { _id: 0, text: "$title", score: "$searchScore" } },
  ]);

  // 🔥 Separate Search for ChannelName
  const channelResults = await Video.aggregate([
    {
      $search: {
        index: "autocomplete",
        autocomplete: {
          query: searchText,
          path: "channelName",
          fuzzy: { maxEdits: 2, prefixLength: 1 },
        },
      },
    },
    { $addFields: { searchScore: { $meta: "searchScore" } } },
    { $match: { searchScore: { $gte: 2 } } }, // ✅ Threshold Filter
    { $project: { _id: 0, text: "$channelName", score: "$searchScore" } },
  ]);

  // ✅ Remove Duplicates Separately
  const uniqueTitles = Array.from(
    new Map(titleResults.map((res) => [res.text, res])).values()
  );
  const uniqueChannels = Array.from(
    new Map(channelResults.map((res) => [res.text, res])).values()
  );

  // ✅ Combine Results into a Single Array
  const combinedResults = [
    ...uniqueTitles.map((res) => ({ text: res.text, score: res.score })),
    ...uniqueChannels.map((res) => ({ text: res.text, score: res.score })),
  ];

  // ✅ Sort by Score in Descending Order
  combinedResults.sort((a, b) => b.score - a.score);

  // ✅ Apply Limit of 10
  const limitedResults = combinedResults.slice(0, 5).map((res) => res.text);

  // console.log("Autocomplete Results:", limitedResults);
  res.status(200).json({ results: limitedResults });
});

// export const getAllVideos = AsyncTryCatch(async (req, res, next) => {
//   // TODO: what the fuck is this for???
//   const videos = await Video.aggregate([
//     {
//       $lookup: {
//         from: "channels",
//         localField: "channel",
//         foreignField: "_id",
//         as: "channel",
//       },
//     },
//     {
//       $unwind: "$channel",
//     },
//     {
//       $project: {
//         title: 1,
//         description: 1,
//         duration: 1,
//         category: 1,
//         channel: "$channel.channelName", // Makes channel a string instead of an object
//       },
//     },
//   ]);

//   return res.status(200).json({ videos });
// });

// deleting comment *******************************************************************
export const deleteComment = AsyncTryCatch(async (req, res, next) => {
  const { commentId } = req.body;
  const channelIdDeletingComment = req.channelId;

  const comment = await Comment.findById(commentId).populate("videoId");
  if (!comment) return next(new ErrorHandler(400, "Comment not found"));

  const commenter = comment.channel;
  const videoOwner = comment.videoId.channel;

  if (
    channelIdDeletingComment === commenter ||
    channelIdDeletingComment === videoOwner
  ) {
    await comment.deleteOne();
    return res.status(200).json({ message: "Comment Deleted Successfully" });
  }

  return next(new ErrorHandler(400, "Unauthorized request"));
});

// delete video *********************************************************************************

export const deleteVideo = AsyncTryCatch(async (req, res, next) => {
  const { videoId } = req.body;
  const channelDeletingVideo = req.channelId;

  const video = await Video.findById(videoId);

  if (!video) {
    return next(new ErrorHandler(404, "Video not found"));
  }
  if (video.channel.toString() !== channelDeletingVideo) {
    return next(new ErrorHandler(400, "Unauthorized request"));
  }

  //delete thumbnail from cloudinary
  deleteImageFromCloudinary(video.thumbnail);
  deleteVideoFromCloudinary(video.videoUrl);
  await Comment.deleteMany({ videoId: videoId });
  await video.deleteOne();
});
