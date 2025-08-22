import jwt from "jsonwebtoken";
import { AsyncTryCatch } from "../middlewares/error.middlewares.js";
import { extractTokenFromRequest, LogedInChannel } from "../utils/utility.js";
import Channel from "../models/channel.model.js";
import Subscription from "../models/subscription.model.js";
import Video from "../models/video.model.js";
import mongoose from "mongoose";

// Example function showing how to use extractTokenFromRequest
// export const getUserInfo = AsyncTryCatch(async (req, res, next) => {
//   // Extract token using the utility function
//   const token = extractTokenFromRequest(req);

//   if (token) {
//     // User is logged in, get their channel ID
//     const channelId = LogedInChannel(token);

//     if (channelId) {
//       // Get user info
//       const channel = await Channel.findById(channelId).select(
//         "channelName email profilePhoto"
//       );
//       return res.status(200).json({
//         message: "User info retrieved",
//         user: channel,
//         isLoggedIn: true,
//       });
//     }
//   }

//   // User not logged in
//   return res.status(200).json({
//     message: "No user logged in",
//     user: null,
//     isLoggedIn: false,
//   });
// });

export const getVideosForHomePage = AsyncTryCatch(async (req, res, next) => {
  const { cursor = null, limit = 20 } = req.body;
  const parsedLimit = parseInt(limit);
  const query = {};
  if (cursor) {
    const cursorId = new mongoose.Types.ObjectId(cursor);
    query._id = { $gt: cursorId };
  }

  const videos = await Video.aggregate([
    { $match: query },
    { $limit: parsedLimit },
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
  ]);
  const hasMore = videos.length === parsedLimit;
  const nextCursor = hasMore ? videos[videos.length - 1]._id : null;

  res.status(200).json({ videos, hasMore, nextCursor });
});
