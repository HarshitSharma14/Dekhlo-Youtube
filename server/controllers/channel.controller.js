import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import { AsyncTryCatch } from "../middlewares/error.middlewares.js";
import Channel from "../models/channel.model.js";
import Notification from "../models/notification.model.js";
import Playlist from "../models/playlist.model.js";
import PlaylistVideos from "../models/playlistVideos.js";
import Setting from "../models/setting.model.js";
import Subscription from "../models/subscription.model.js";
import Video from "../models/video.model.js";
import { emitNotification } from "../socket.js";
import {
  UpdateThumbnail,
  UploadSinglePhotoToCloudinary,
  UploadVideoAndThumbnail,
} from "../utils/features.js";
import { ErrorHandler, LogedInChannel } from "../utils/utility.js";

//✅ get self channel if logged in ************************************************************************************
export const getSelfChannelInfo = AsyncTryCatch(async (req, res, next) => {
  const channel = await Channel.findById(req.channelId)
    .select(
      "channelName email profilePhoto bio subscribersCount videosCount views permanentPlaylist"
    )
    .lean();
  // .populate("playlists", "name private");    // change the fronted get the playlist when it is needed do get it in the start
  const dataToSend = {
    _id: channel._id,
    channelName: channel.channelName,
    email: channel.email,
    profilePhoto: channel.profilePhoto,
    bio: channel.bio,
    followers: channel.subscribersCount,
    videos: channel.videosCount,
    views: channel.views,
    permanentPlaylist,
  };

  res
    .status(200)
    .json({ message: "Channel Info fetched ", channel: dataToSend });
});

// get channel in general *******************************************************************************************
export const getChannelInfo = AsyncTryCatch(async (req, res, next) => {
  const { channelId } = req.params;
  console.log(channelId);
  let isOwner = false;
  let isSubscribed = false;

  const channelIdVisiting = LogedInChannel(req.cookies?.jwt);
  if (channelIdVisiting)
    isOwner = channelIdVisiting.toString() === channelId.toString();

  const channel = await Channel.findById(channelId)
    .select(
      "channelName email profilePhoto bio coverImage subscribersCount videosCount views"
    )
    .lean();
  if (!channel) next(new ErrorHandler(404, "Channel not found"));

  if (channelIdVisiting && !isOwner) {
    isSubscribed = await Subscription.findOne({
      subscriber: channelIdVisiting,
      creator: channelId,
    }); // TODO:  there is no compound index for this, discuss if needed
  }

  const dataToSend = {
    channelName: channel.channelName,
    email: channel.email,
    profilePhoto: channel.profilePhoto,
    bio: channel.bio,
    coverImage: channel.coverImage,
    followers: channel.subscribersCount,
    videos: channel.videosCount,
    views: channel.views,
    isOwner,
    isSubscribed: !!isSubscribed,
    isBell: isSubscribed?.bell,
  };

  res
    .status(200)
    .json({ message: "Channel Info fetched ", channel: dataToSend });
});

// update profile ********************************************************************************************
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
  ); // TODO: if channel updates fails delete the photo from cloudinary

  res
    .status(200)
    .json({ message: "Profile updated successfully", channel: channel });
});

// subscribe ************************************************************************************************
export const subscribeChannel = AsyncTryCatch(async (req, res, next) => {
  const { creatorId } = req.body;

  const channelToBeSubscribed = await Channel.findById(creatorId);

  if (!channelToBeSubscribed) next(new ErrorHandler(404, "Channel not found"));

  const isSubsriptionAlreadyExist = await Subscription.findOne({
    subscriber: req.channelId,
    creator: creatorId,
  }); // TODO: the compound index needs here too

  if (isSubsriptionAlreadyExist)
    return next(new ErrorHandler(400, "User already subscribed"));

  const newSubscription = new Subscription({
    subscriber: req.channelId,
    creator: creatorId,
    bell: true,
  });

  await newSubscription.save();

  channelToBeSubscribed.subscribersCount =
    channelToBeSubscribed.subscribersCount + 1;
  await channelToBeSubscribed.save();

  const channelName = (
    await Channel.findById(req.channelId).select("channelName").lean()
  )?.channelName;

  const creatorSettings = await Setting.findById({
    _id: channelToBeSubscribed.settings,
  }).lean();

  if (creatorSettings && creatorSettings.newFollowerNotification) {
    const notification = new Notification({
      channel: creatorId,
      message: `<span style="color: #1DA1F2; font-weight: bold;">${channelName}</span> 
      subscribed your channel.`,
      isRead: false,
    });

    await notification.save();

    emitNotification(creatorId, {
      message: notification.message,
      channel: creatorId,
      isRead: false,
      createdAt: notification.createdAt, // TODO: i dont know about these functions check it once
    });
  }

  return res.status(200).json({ message: "Channel subscribed successfully" });
});

// change the state of the notification ************************************************************************
export const changeIsread = AsyncTryCatch(async (req, res, next) => {
  const { channelId } = req;
  const { t } = req.query;

  const notifications = await Notification.updateMany(
    { channel: channelId, createdAt: { $lte: new Date(t) } }, //   TODO: there can be a lot of notification for a channel do consider a compound index with createdAt
    { $set: { isRead: true } }
  );

  res.status(200).json({
    message: "Notifications updated successfully.",
    updatedCount: notifications.modifiedCount,
  });
});

// unsubscribe ************************************************************************************************
export const unSubscribeChannel = AsyncTryCatch(async (req, res, next) => {
  const { creatorId } = req.body;

  const channelToBeUnSubscribed = await Channel.findById(creatorId);

  if (!channelToBeUnSubscribed)
    return next(new ErrorHandler(404, "Channel does not exist anymore"));

  const subscription = await Subscription.findOneAndDelete({
    subscriber: req.channelId,
    creator: creatorId,
  }); // TODO: need the compound index here too, the third time.

  if (!subscription)
    return next(new ErrorHandler(400, "User already unsubscribed"));

  channelToBeUnSubscribed.subscribersCount -= 1;
  await channelToBeUnSubscribed.save();

  return res.status(200).json({ message: "Channel unsubscribed successfully" });
});

//✅ get notifications ************************************************************************************************
export const getNotifications = AsyncTryCatch(async (req, res, next) => {
  const channelId = req.channelId;

  const notifications = await Notification.find({ channel: channelId }).sort({
    createdAt: 1,
  });

  return res.status(200).json(notifications);
});

// get watch history **********************************************
export const getWatchHistory = AsyncTryCatch(async (req, res, next) => {
  // TODO: consider using the getPlaylistVideo function for this too, as the history is also a playlist and the histPlayId can be found in the user details

  const { page = 1, limit = 20 } = req.query;

  let affectiveLimit = limit;

  const myChannel = await Channel.findById(req.channelId);

  const watchHistoryPlaylistId = myChannel.permanentPlaylist[1];

  const watchHistoryPlaylist = await Playlist.findById(
    watchHistoryPlaylistId
  ).select("videosCount");
  const totalCount = watchHistoryPlaylist.videosCount;

  let videosLeftToSendForNextQuery = totalCount - page * limit;

  const skipValue = (page - 1) * limit;

  if (videosLeftToSendForNextQuery < 0) {
    affectiveLimit = parseInt(limit) + parseInt(videosLeftToSendForNextQuery);
  }

  const rawResults = await PlaylistVideos.find({
    playlist: watchHistoryPlaylistId,
  })
    .sort({ createdAt: -1 })
    .skip(skipValue)
    .limit(affectiveLimit)
    .populate("videoId");

  // if (!channelVideos) {
  //   return next(new ErrorHandler(404, "Error: Channel not found"));
  // // }

  const videos = [];

  for (const entry of rawResults) {
    if (entry.videoId) {
      videos.push(entry.videoId);
    } else {
      // video was deleted, so remove from PlaylistVideos
      await PlaylistVideos.findByIdAndDelete(entry._id);
    }
  }

  console.log(videos);

  // const channel = await Channel.findById(req.channelId)
  //   .select("watchHistory")
  //   .populate({
  //     path: "watchHistory",
  //     options: {
  //       skip: skipValue,
  //       limit: parseInt(affectiveLimit),
  //     },
  //   });
  // const historyInOrder = channel.watchHistory.reverse();

  const totalPages = Math.ceil(totalCount / limit) || 0;
  res.status(200).json({ videos, totalPages });
});

// upload/update video ********************************************************************************************
export const updateVideo = AsyncTryCatch(async (req, res, next) => {
  // TODO: tera likha huva hai, tu dekh le sabh kuchh shi hai naa aur sari phaltu ki cheeje hata de, comments and consoles etcs
  console.log("in upload video");
  // console.log("inside")
  const {
    title,
    description,
    channelId,
    isPrivate,
    canComment,
    category,
    duration,
    videoId,
  } = req.body;
  // console.log(channelId)
  // console.log(req.files.video)
  // console.log(req.files.thumbnail)
  let videoIfAvailable = null;
  // console.log(videoId?.length);
  if (videoId && videoId.toString() !== "null") {
    // console.log("in");
    videoIfAvailable = await Video.findById(videoId);
  }
  if (videoIfAvailable) {
    // console.log(channelId)
    // console.log(videoIfAvailable.channel)

    if (channelId !== videoIfAvailable.channel.toString()) {
      return next(
        new ErrorHandler(400, "Video does not belong to this channel")
      );
    }

    const updateFields = {
      title,
      description,
      isPrivate,
      canComment,
      category,
    };

    if (req.files.thumbnail) {
      //first adding the new thumbnail
      const { thumbnailUrlNew } = await UpdateThumbnail(req);

      updateFields.thumbnailUrl = thumbnailUrlNew;

      if (thumbnailUrlNew) {
        //if new thumbnail successfully added, deleting the older thumbnail
        function getPublicIdFromUrl(url) {
          // RegEx to extract the public ID from Cloudinary URL
          const regex = /\/upload\/(?:v\d+\/)?([^\/\.]+)/;
          const match = url.match(regex);

          if (match && match[1]) {
            return match[1]; // Return the public ID
          } else {
            return null; // Return null if no match is found
          }
        }

        // Example usage
        const url = videoIfAvailable.thumbnailUrl;
        const publicId = getPublicIdFromUrl(url);

        const deleteImageFromCloudinary = async (publicId) => {
          try {
            const result = await cloudinary.uploader.destroy(publicId);
            console.log("Image deleted successfully:", result);
          } catch (error) {
            console.error("Error deleting image:", error);
          }
        };

        deleteImageFromCloudinary(publicId);
      }
    }

    const updatedVideo = await Video.findByIdAndUpdate(videoId, updateFields, {
      new: true, // Return the updated document
      runValidators: true, // Apply schema validation
    });

    return res
      .status(201)
      .json({ message: "Video updated successfully", updatedVideo });
  }

  if (!req.files.thumbnail || !req.files.video || !title || !channelId) {
    return next(
      new ErrorHandler(400, "Please provide all the required fields")
    );
  }

  // console.log("inside2")

  const { videoUrlNew, thumbnailUrlNew } = await UploadVideoAndThumbnail(req);
  // console.log("inside3");

  const videonew = new Video({
    title,
    description,
    videoUrl: videoUrlNew,
    thumbnailUrl: thumbnailUrlNew,
    channel: channelId,
    isPrivate,
    canComment,
    category,
    duration,
  });

  console.log("done");
  await videonew.save();

  const subscibersId = await Subscription.find({
    creator: channelId,
    bell: true,
  }).select("subscriber");

  const channel = await Channel.findById(channelId).select("channelName");

  console.log("getting in");

  // console.log(channel.followers)

  for (const { subscriber } of subscibersId) {
    const notification = new Notification({
      channel: subscriber,
      message: `<span style="color: #1DA1F2; font-weight: bold;">${channel.channelName}</span> 
      has posted a new video:
      <span style="color: #FFD700; font-weight: bold;">${videonew.title}</span>`,
      isRead: false,
    });
    await notification.save();

    console.log("in noti");
    console.log(subscriber);
    emitNotification(subscriber.toString(), {
      message: notification.message,
      channel: subscriber,
      isRead: false,
      createdAt: notification.createdAt,
    });
  }

  return res
    .status(201)
    .json({ message: "Video uploaded successfully", videonew });
});

//✅ get Channel Videoss *********************************************************************************
export const getChannelVideos = AsyncTryCatch(async (req, res, next) => {
  const channelIdForVideos = req.params.channelId;
  const { cursor, limit = 20, sortField = "_id", sortOrder = 1 } = req.query;

  // Validate sortField
  const ALLOWED_SORT_FIELDS = ["_id", "views"];
  if (!ALLOWED_SORT_FIELDS.includes(sortField)) {
    return res.status(400).json({ message: "Invalid sort field" });
  }

  // Sanitize limit
  const sanitizedLimit = Math.min(Number(limit), 100);

  // Check if channel exists
  const channel = await Channel.findById(channelIdForVideos);
  if (!channel) {
    return res.status(404).json({ message: "Channel not found" });
  }

  // Determine if private videos can be shown
  let canSendPrivateVideos = false;

  const channelIdVisiting = LogedInChannel(req.cookies?.jwt);
  if (channelIdVisiting)
    canSendPrivateVideos =
      channelIdVisiting.toString() === channelIdForVideos.toString();

  const query = {
    channel: channelIdForVideos,
  };

  // Add pagination logic if cursor exists
  if (cursor) {
    let parsedCursor;
    try {
      parsedCursor = typeof cursor === "string" ? JSON.parse(cursor) : cursor;
    } catch {
      return res.status(400).json({ message: "Invalid cursor format" });
    }

    const cursorValue = parsedCursor.value;
    const cursorId = new mongoose.Types.ObjectId(parsedCursor._id.toString());

    if (sortField === "_id") {
      query._id = { [sortOrder === 1 ? "$gt" : "$lt"]: cursorId };
    } else {
      query.$or = [
        { [sortField]: { [sortOrder === 1 ? "$gt" : "$lt"]: cursorValue } },
        {
          [sortField]: cursorValue,
          _id: { [sortOrder === 1 ? "$gt" : "$lt"]: cursorId },
        },
      ];
    }
  }

  // Build sort object
  const sortObj =
    sortField === "_id"
      ? { _id: Number(sortOrder) }
      : {
          [sortField]: Number(sortOrder),
          _id: Number(sortOrder),
        };

  // Fetch videos
  const unfilteredVideos = await Video.find(query)
    .sort(sortObj)
    .limit(sanitizedLimit)
    .lean();

  const videos = unfilteredVideos.filter((vid) => {
    return canSendPrivateVideos || !vid.isPrivate;
  });

  // Prepare next cursor
  let nextCursor = null;

  if (unfilteredVideos.length > 0) {
    const lastVideo = unfilteredVideos[videos.length - 1];
    nextCursor = {
      value: lastVideo[sortField],
      _id: lastVideo._id,
    };
  }

  res.status(200).json({
    message: "Videos fetched successfully",
    videos,
    nextCursor,
    hasMore: unfilteredVideos.length === sanitizedLimit,
  });
});

// export const getPlaylistVideos = AsyncTryCatch(async (req, res, next) => {
//   const { playlistId } = req.query;

//   const token = req.cookies.jwt;
//   const decodedData = jwt.verify(token, JWT_SECRET);
//   const channelId = decodedData.channelId;

//   const playlist = await Playlist.findById(playlistId).populate({
//     path: "videos",
//     select: "title thumbnailUrl views duration channel",
//     populate: {
//       path: "channel", // Populating channel inside each video
//       select: "channelName profilePhoto", // Add fields you need
//     },
//   })
//     .populate("channel", "channelName");
//   console.log('intttttttt')
//   console.log(playlist)
//   if (playlist.private === true && (channelId.toString() !== playlist.channel._id.toString())) {
//     return next(new ErrorHandler(400, "Playlist is private"));

//   }
//   return res.status(200).json({ playlist });
// })

// toggle bell *********************************************************************************
export const toggleBell = AsyncTryCatch(async (req, res, next) => {
  const { creatorId } = req.body;
  const subscription = await Subscription.findOne({
    subscriber: req.channelId,
    creator: creatorId,
  }); // TODO:  need coumpound index;

  if (!subscription)
    return next(new ErrorHandler(404, "Subscription not found"));

  subscription.bell = !subscription.bell;
  await subscription.save();

  res.status(200).json({ success: true });
});

//✅ get getSubscribedChannel *****************************************************************
export const getSubscribedChannel = AsyncTryCatch(async (req, res, next) => {
  const subs = await Subscription.aggregate([
    { $match: { subscriber: new mongoose.Types.ObjectId(req.channelId) } },
    {
      $lookup: {
        from: "channels",
        localField: "creator",
        foreignField: "_id",
        as: "creator",
      },
    },
    {
      $unwind: {
        path: "$creator",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        "creator._id": 1,
        "creator.channelName": 1,
        "creator.bio": 1,
        "creator.profilePhoto": 1,
        "creator.subscribersCount": 1,
        "creator.email": 1,
      },
    },
  ]);

  const invalidSubIds = subs // creator which have deleted their channels
    .filter((sub) => !sub.creator)
    .map((sub) => sub._id);

  if (invalidSubIds.length > 0) {
    await Subscription.deleteMany({ _id: { $in: invalidSubIds } });
  }

  const following = subs.filter((sub) => sub.creator).map((sub) => sub.creator);

  res.status(200).json({ following });
});

//✅ get any channels playlist **********************************************************************************
export const getChannelPlaylists = AsyncTryCatch(async (req, res, next) => {
  const channelId = req.params.channelId;

  let canSendPrivatePlaylist = false;
  const channelIdVisiting = LogedInChannel(req.cookies?.jwt);
  if (channelIdVisiting)
    canSendPrivatePlaylist =
      channelIdVisiting.toString() === channelId.toString();

  const matchQuery = {
    channelId: mongoose.Types.ObjectId(channelId),
  };
  if (canSendPrivatePlaylist) matchQuery.isPrivate = false;

  const playlists = await Playlist.aggregate([
    {
      $match: matchQuery,
    },
    {
      $lookup: {
        from: "playlistvideos",
        localField: "_id",
        foreignField: "playlistId",
        pipeline: [
          { $sort: { createdAt: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: "videos",
              localField: "videoId",
              foreignField: "_id",
              pipeline: [
                {
                  $project: {
                    _id: 1,
                    thumbnailUrl: 1,
                  },
                },
              ],
              as: "video",
            },
          },
          { $unwind: "$video" },
          { $replaceRoot: { newRoot: "$video" } },
          { $limit: 3 },
        ],
        as: "videos",
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        videos: 1,
        videosCount: 1,
      },
    },
  ]);

  res.status(200).json({ playlists });
});

//✅ get my channels playlist **********************************************************************************
export const getMyPlaylists = AsyncTryCatch(async (req, res, next) => {
  const channelId = req.channelId;
  const playlists = await Playlist.find({ channel: channelId }).select(
    "name isPrivate"
  );

  res.status(200).json({ playlists });
});

// Add to Playlist *************************************************************************
export const addVideosToPlaylist = AsyncTryCatch(async (req, res, next) => {
  const {
    playlistIds = [],
    name = "Untitled",
    isPrivate = true,
    videoId,
  } = req.body;

  if (!videoId) return next(new ErrorHandler(400, "Video not found"));

  // Create a new playlist if none are provided
  if (playlistIds.length === 0) {
    const newPlaylist = new Playlist({
      name,
      channel: req.channelId,
      videoCount: 0,
      isPrivate,
    });

    await newPlaylist.save();

    playlistIds.push(newPlaylist._id);
  }

  try {
    // Create video documents for each playlist
    const videosToInsert = playlistIds.map((id) => ({
      videoId,
      playlistId: id,
    }));

    await PlaylistVideos.insertMany(videosToInsert);

    // Increment video count in all affected playlists
    await Playlist.updateMany(
      { _id: { $in: playlistIds } },
      { $inc: { videosCount: 1 } } // TODO: can use mongoose transaction to do this task;
    );
  } catch (err) {
    console.error("Error inserting videos:", err);

    await Playlist.deleteMany({
      _id: { $in: playlistIds },
      videosCount: 0,
    });

    return next(new ErrorHandler(500, "Failed to add videos to playlist"));
  }

  res.status(200).json({ success: true });
});

//✅ get videso of playlist *****************************************************************
export const getPlaylistVideos = AsyncTryCatch(async (req, res, next) => {
  const { playlistId, cursor, limit = 20 } = req.query;

  if (!playlistId) return next(new ErrorHandler(400, "Missing playlistId"));

  const parsedLimit = parseInt(limit);

  const query = { playlistId };
  if (cursor) {
    query._id = { $lt: new mongoose.Types.ObjectId(cursor) };
  }

  const playlistVideos = await PlaylistVideos.aggregate([
    { $match: query },
    { $sort: { _id: -1 } },
    { $limit: parsedLimit },
    {
      $lookup: {
        from: "videos",
        localField: "videoId",
        foreignField: "_id",
        as: "video",
      },
    },
    {
      $unwind: {
        path: "$video",
        preserveNullAndEmptyArrays: true,
      },
    },
  ]);

  const videos = [];
  const idsToDelete = [];
  for (const entry of playlistVideos) {
    if (entry.video) {
      videos.push(entry.video);
    } else {
      idsToDelete.push(entry._id);
    }
  }

  if (idsToDelete.length > 0) {
    await PlaylistVideos.deleteMany({ _id: { $in: idsToDelete } });
    await Playlist.updateOne(
      { _id: playlistId },
      { $inc: { videosCount: -idsToDelete.length } }
    );
  }

  const hasMore = playlistVideos.length === parsedLimit;
  const nextCursor = hasMore
    ? playlistVideos[playlistVideos.length - 1]._id
    : null;

  res.status(200).json({ videos, hasMore, nextCursor });
});
