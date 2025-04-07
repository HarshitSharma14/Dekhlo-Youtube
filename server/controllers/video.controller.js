import { AsyncTryCatch } from "../middlewares/error.middlewares.js";
import Channel from "../models/channel.model.js";
import Video from "../models/video.model.js";
import { JWT_SECRET } from "../utils/constants.js";
import { ErrorHandler } from "../utils/utility.js";
import jwt from "jsonwebtoken";
import Comment from "../models/comment.model.js";
import Subscription from "../models/subscription.model.js";
import mongoose from "mongoose";
import Notification from "../models/notification.model.js";
import { emitNotification } from "../socket.js";
// view video *************************************************************
export const getVideo = AsyncTryCatch(async (req, res, next) => {
  // console.log("in");

  const { videoId } = req.params;
  // console.log(videoId);
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

  let decodedData = null;

  let isLiked = false
  let isSubscribed = false
  let isBell = false

  try {
    const token = req.cookies.jwt;
    decodedData = jwt.verify(token, JWT_SECRET);
    await Channel.findByIdAndUpdate(decodedData.channelId, {
      $push: { watchHistory: videoId },
    });
    isLiked = (await Channel.exists({
      _id: decodedData.channelId,
      likedVideos: videoId,
    }))
      ? true
      : false;

    const subscription = await Subscription.findOne({ subscriber: decodedData.channelId, creator: video.channel })

    if (subscription) {
      isSubscribed = true
      if (subscription.bell) {
        isBell = true
      }
    }

    return res.status(200).json({ video, isLiked, loggedIn: true, isSubscribed, isBell });
  } catch (error) {
    console.log("user not logged in to save to watch history");
  }


  // console.log(isLiked);

  return res.status(200).json({ video, isLiked, loggedIn: false, isSubscribed, isBell });
});

export const getComments = AsyncTryCatch(async (req, res, next) => {
  const { videoId } = req.params;
  const { limit = 2, skip = 0 } = req.query; // Default limit is 20, skip is 0

  // console.log("bla bla bla");

  // console.log("skip", skip);

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

export const getWatchNext = AsyncTryCatch(async (req, res, next) => {
  const { videoId } = req.params;
  const cursor = req.query.cursor;
  const limit = 3
  const video = await Video.findById(videoId);
  if (!video) {
    return next(new ErrorHandler(404, "Video not found"));
  }

  let query = { channel: video.channel, _id: { $ne: videoId } };

  if (cursor) {
    query._id = { $gt: cursor, $ne: videoId }; // Fetch videos with _id > cursor (next batch)
  }

  const watchNext = await Video.find(query).populate("channel", "profilePhoto channelName").limit(limit);
  // console.log('watchnext')
  // console.log(watchNext)
  return res.status(200).json({ watchNext });
})

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

  const video = await Video.findById(videoId).select("channel title")

  console.log(video.channel)

  const notification = new Notification({
    channel: video.channel,
    message: `<span style="color: #1DA1F2; font-weight: bold;">${newComment.channel.channelName}</span> 
              commented on your video:
              <span style="color: #FFD700; font-weight: bold;">${video.title}</span><br />
              <i>"${text}"</i>`,
    isRead: false
  })

  await notification.save()

  emitNotification(video.channel.toString(), {
    message: notification.message,
    channel: notification.channel,
    isRead: false,
    createdAt: notification.createdAt,
  })


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


    const notification = new Notification({
      channel: video.channel,
      message: `<span style="color: #1DA1F2; font-weight: bold;">${channel.channelName}</span> 
              has liked your video: 
              <span style="color: #FFD700; font-weight: bold;">${video.title}</span>`,
      isRead: false,
    })

    await notification.save()
    console.log('liking')
    console.log(video.channel)
    emitNotification(video.channel.toString(), {
      message: notification.message,
      channel: video.channel,
      isRead: false,
      createdAt: notification.createdAt,
    })

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
  // console.log(videoDetails);

  return res.status(200).json({ videoDetails });
});

export const searchVideo = AsyncTryCatch(async (req, res, next) => {
  const { searchText } = req.query;
  // console.log("yessur ", searchText);
  const cursor = req.query?.cursor;
  const limit = 10;

  const results = await Video.aggregate([
    {
      $search: {                                  // 🔥 Atlas Search with Fuzzy Matching
        index: "search",
        compound: {
          should: [
            {                                      // ✅ High weight for channel name
              text: {
                query: searchText,
                path: "channelName",
                fuzzy: { maxEdits: 2 },
                score: { boost: { value: 3 } }
              }
            },
            {                                      // ✅ Medium weight for title and category
              text: {
                query: searchText,
                path: ["title", "category"],
                fuzzy: { maxEdits: 2 },
                score: { boost: { value: 10 } }
              }
            },
            {                                      // ✅ Low weight for description
              text: {
                query: searchText,
                path: ["description"],
                fuzzy: { maxEdits: 2 },
                score: { boost: { value: 2 } }
              }
            }
          ],
          minimumShouldMatch: 1
        }
      }
    },
    // ✅ Cursor filter applied early for efficiency
    ...(cursor ? [{ $match: { _id: { $gt: new mongoose.Types.ObjectId(cursor) } } }] : []),
    {
      $lookup: {
        from: "channels",                  // ✅ Correct collection name
        localField: "channel",             // ✅ Reference field in `videos`
        foreignField: "_id",               // ✅ `_id` field in `channels`
        as: "channel"
      }
    },
    {
      $unwind: {
        path: "$channel",
        preserveNullAndEmptyArrays: true   // ✅ Avoid breaking if no match is found
      }
    },
    {
      $addFields: {                                // ✅ Add relevance score
        searchScore: { $meta: "searchScore" }
      }
    },
    {
      $facet: {                                     // ✅ Parallel pipelines
        metadata: [
          {
            $group: {                              // ✅ Min/Max values for normalization
              _id: null,
              maxViews: { $max: "$views" },
              minViews: { $min: "$views" },
              maxScore: { $max: "$searchScore" },
              minScore: { $min: "$searchScore" }
            }
          }
        ],
        results: [
          { $limit: 50 }                          // ✅ Fetch initial batch
        ]
      }
    },
    { $unwind: "$metadata" },
    { $unwind: "$results" },

    // ✅ Deduplicate by grouping on _id
    {
      $group: {
        _id: "$results._id",
        doc: { $first: "$results" },              // Keep only one instance
        combinedScore: { $first: "$combinedScore" }
      }
    },

    // ✅ Flatten the grouped structure
    { $replaceRoot: { newRoot: { $mergeObjects: ["$doc", { combinedScore: "$combinedScore" }] } } },

    // ✅ Sort by combined score
    { $sort: { combinedScore: -1, _id: 1 } },

    // ✅ Limit results
    { $limit: limit }
  ]);

  // console.log("results", results.length);

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
          fuzzy: { maxEdits: 2, prefixLength: 1 }
        }
      }
    },
    { $addFields: { searchScore: { $meta: "searchScore" } } },
    { $match: { searchScore: { $gte: 2 } } },                  // ✅ Threshold Filter
    { $project: { _id: 0, text: "$title", score: "$searchScore" } }
  ]);

  // 🔥 Separate Search for ChannelName
  const channelResults = await Video.aggregate([
    {
      $search: {
        index: "autocomplete",
        autocomplete: {
          query: searchText,
          path: "channelName",
          fuzzy: { maxEdits: 2, prefixLength: 1 }
        }
      }
    },
    { $addFields: { searchScore: { $meta: "searchScore" } } },
    { $match: { searchScore: { $gte: 2 } } },                  // ✅ Threshold Filter
    { $project: { _id: 0, text: "$channelName", score: "$searchScore" } }
  ]);

  // ✅ Remove Duplicates Separately
  const uniqueTitles = Array.from(new Map(titleResults.map(res => [res.text, res])).values());
  const uniqueChannels = Array.from(new Map(channelResults.map(res => [res.text, res])).values());

  // ✅ Combine Results into a Single Array
  const combinedResults = [
    ...uniqueTitles.map(res => ({ text: res.text, score: res.score })),
    ...uniqueChannels.map(res => ({ text: res.text, score: res.score }))
  ];

  // ✅ Sort by Score in Descending Order
  combinedResults.sort((a, b) => b.score - a.score);

  // ✅ Apply Limit of 10
  const limitedResults = combinedResults.slice(0, 5).map(res => res.text);

  // console.log("Autocomplete Results:", limitedResults);
  res.status(200).json({ results: limitedResults });
});




export const getAllVideos = AsyncTryCatch(async (req, res, next) => {
  const videos = await Video.aggregate([
    {
      $lookup: {
        from: "channels",
        localField: "channel",
        foreignField: "_id",
        as: "channel",
      }
    },
    {
      $unwind: "$channel"
    },
    {
      $project: {
        title: 1,
        description: 1,
        duration: 1,
        category: 1,
        channel: "$channel.channelName" // Makes channel a string instead of an object
      }
    }
  ]);

  return res.status(200).json({ videos });
});





