import { v2 as cloudinary } from "cloudinary";
import mongoose, { mongo } from "mongoose";
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
  deleteImageFromCloudinary,
  UpdateThumbnail,
  UploadSinglePhotoToCloudinary,
  UploadVideoAndThumbnail,
} from "../utils/features.js";
import { ErrorHandler, LogedInChannel } from "../utils/utility.js";

//✅✅ get self channel if logged in ************************************************************************************
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
    permanentPlaylist: channel.permanentPlaylist,
  };
  res
    .status(200)
    .json({ message: "Channel Info fetched ", channel: dataToSend });
});

//✅✅ get channel in general *******************************************************************************************
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
    });
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

//✅✅ update profile ********************************************************************************************
export const updateProfile = AsyncTryCatch(async (req, res, next) => {
  const { channelName, bio, password, profilePhotoUrl } = req.body;
  let profilePhoto = profilePhotoUrl;

  if (req.file) {
    profilePhoto = await UploadSinglePhotoToCloudinary(req);
  }
  let channel = null;
  try {
    channel = await Channel.findByIdAndUpdate(
      req.channelId,
      {
        channelName,
        bio,
        password,
        profilePhoto,
      },
      { new: true, runValidators: true }
    );
  } catch (error) {
    if (req.file) {
      deleteImageFromCloudinary(profilePhoto);
    }
  }

  res
    .status(200)
    .json({ message: "Profile updated successfully", channel: channel });
});

//✅✅ subscribe ************************************************************************************************
export const subscribeChannel = AsyncTryCatch(async (req, res, next) => {
  const { creatorId } = req.body;

  const channelToBeSubscribed = await Channel.findById(creatorId);

  if (!channelToBeSubscribed) next(new ErrorHandler(404, "Channel not found"));

  const isSubsriptionAlreadyExist = await Subscription.findOne({
    subscriber: req.channelId,
    creator: creatorId,
  });

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

  console.log("settingsId ", channelToBeSubscribed.settings);

  const creatorSettings = await Setting.findById(
    channelToBeSubscribed.settings
  ).lean();

  console.log(
    "creator setting",
    creatorSettings,
    creatorSettings?.newFollowerNotification
  );
  if (creatorSettings && creatorSettings.newFollowerNotification) {
    console.log("in side");
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
      createdAt: notification.createdAt,
    });
  }

  return res.status(200).json({ message: "Channel subscribed successfully" });
});

//✅✅ change the state of the notification ************************************************************************
export const changeIsread = AsyncTryCatch(async (req, res, next) => {
  const { channelId } = req;
  const { t } = req.query;

  const notifications = await Notification.updateMany(
    { channel: channelId, createdAt: { $lte: new Date(t) } },
    { $set: { isRead: true } }
  );

  res.status(200).json({
    message: "Notifications updated successfully.",
    updatedCount: notifications.modifiedCount,
  });
});

//✅✅ unsubscribe ************************************************************************************************
export const unSubscribeChannel = AsyncTryCatch(async (req, res, next) => {
  const { creatorId } = req.body;

  const channelToBeUnSubscribed = await Channel.findById(creatorId);

  if (!channelToBeUnSubscribed)
    return next(new ErrorHandler(404, "Channel does not exist anymore"));

  const subscription = await Subscription.findOneAndDelete({
    subscriber: req.channelId,
    creator: creatorId,
  });

  if (!subscription)
    return next(new ErrorHandler(400, "User already unsubscribed"));

  channelToBeUnSubscribed.subscribersCount -= 1;
  await channelToBeUnSubscribed.save();

  return res.status(200).json({ message: "Channel unsubscribed successfully" });
});

//✅✅ get notifications ************************************************************************************************
export const getNotifications = AsyncTryCatch(async (req, res, next) => {
  const channelId = req.channelId;

  const notifications = await Notification.find({ channel: channelId }).sort({
    createdAt: 1,
  });

  return res.status(200).json(notifications);
});

// get watch history **********************************************
// export const getWatchHistory = AsyncTryCatch(async (req, res, next) => {
//   // TODO: consider using the getPlaylistVideo function for this too, as the history is also a playlist and the histPlayId can be found in the user details

//   const { page = 1, limit = 20 } = req.query;

//   let affectiveLimit = limit;

//   const myChannel = await Channel.findById(req.channelId);

//   const watchHistoryPlaylistId = myChannel.permanentPlaylist.watchHistory;

//   const watchHistoryPlaylist = await Playlist.findById(
//     watchHistoryPlaylistId
//   ).select("videosCount");
//   const totalCount = watchHistoryPlaylist.videosCount;

//   let videosLeftToSendForNextQuery = totalCount - page * limit;

//   const skipValue = (page - 1) * limit;

//   if (videosLeftToSendForNextQuery < 0) {
//     affectiveLimit = parseInt(limit) + parseInt(videosLeftToSendForNextQuery);
//   }

//   const rawResults = await PlaylistVideos.find({
//     playlist: watchHistoryPlaylistId,
//   })
//     .sort({ createdAt: -1 })
//     .skip(skipValue)
//     .limit(affectiveLimit)
//     .populate("videoId");

//   // if (!channelVideos) {
//   //   return next(new ErrorHandler(404, "Error: Channel not found"));
//   // // }

//   const videos = [];

//   for (const entry of rawResults) {
//     if (entry.videoId) {
//       videos.push(entry.videoId);
//     } else {
//       // video was deleted, so remove from PlaylistVideos
//       await PlaylistVideos.findByIdAndDelete(entry._id);
//     }
//   }

//   console.log(videos);

//   // const channel = await Channel.findById(req.channelId)
//   //   .select("watchHistory")
//   //   .populate({
//   //     path: "watchHistory",
//   //     options: {
//   //       skip: skipValue,
//   //       limit: parseInt(affectiveLimit),
//   //     },
//   //   });
//   // const historyInOrder = channel.watchHistory.reverse();

//   const totalPages = Math.ceil(totalCount / limit) || 0;
//   res.status(200).json({ videos, totalPages });
// });

//✅✅ upload/update video ********************************************************************************************
export const updateVideo = AsyncTryCatch(async (req, res, next) => {
  // TODO: tera likha huva hai, tu dekh le sabh kuchh shi hai naa aur sari phaltu ki cheeje hata de, comments and consoles etcs
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

  let videoIfAvailable = null;

  if (videoId && videoId.toString() !== "null") {
    videoIfAvailable = await Video.findById(videoId);
  }
  if (videoIfAvailable) {
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
        deleteImageFromCloudinary(videoIfAvailable.thumbnailUrl);
      }
    }

    await Video.findByIdAndUpdate(videoId, updateFields, {
      runValidators: true, // Apply schema validation
    });

    return res.status(201).json({ message: "Video updated successfully" });
  }

  if (!req.files.thumbnail || !req.files.video || !title || !channelId) {
    return next(
      new ErrorHandler(400, "Please provide all the required fields")
    );
  }

  const { videoUrlNew, thumbnailUrlNew } = await UploadVideoAndThumbnail(req);

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

  await videonew.save();

  // const subscibersId = await Subscription.find({
  //   creator: channelId,
  //   bell: true,
  // }).select("subscriber");

  // const channel = await Channel.findById(channelId).select("channelName");

  // for (const { subscriber } of subscibersId) {
  //   const notification = new Notification({
  //     channel: subscriber,
  //     message: `<span style="color: #1DA1F2; font-weight: bold;">${channel.channelName}</span>
  //     has posted a new video:
  //     <span style="color: #FFD700; font-weight: bold;">${videonew.title}</span>`,
  //     isRead: false,
  //   });
  //   await notification.save();

  //   emitNotification(subscriber.toString(), {
  //     message: notification.message,
  //     channel: subscriber,
  //     isRead: false,
  //     createdAt: notification.createdAt,
  //   });
  // }

  return res.status(201).json({ message: "Video uploaded successfully" });
});

//send new video notifications
export const sendNewVideoNotification = AsyncTryCatch(
  async (req, res, next) => {
    const channelId = req.body?.channelId;
    const subscibersId = await Subscription.find({
      creator: channelId,
      bell: true,
    }).select("subscriber");

    const channel = await Channel.findById(channelId).select("channelName");

    const notificationDocs = subscibersId.map(({ subscriber }) => ({
      channel: subscriber,
      message: `<span style="color: #1DA1F2; font-weight: bold;">${channel.channelName}</span> 
    has posted a new video:
    <span style="color: #FFD700; font-weight: bold;">${videonew.title}</span>`,
      isRead: false,
    }));

    // ✅ Save all notifications in one DB call
    const notifications = await Notification.insertMany(notificationDocs);

    // ✅ Emit notifications in parallel (no DB ops here)
    notifications.forEach((notif) => {
      emitNotification(notif.channel.toString(), {
        message: notif.message,
        channel: notif.channel,
        isRead: false,
        createdAt: notif.createdAt,
      });
    });

    return res.status(200).json({
      message: "Notifications sent successfully",
      count: notifications.length,
    });
  }
);

//✅ get Channel Videoss *********************************************************************************
export const getChannelVideos = AsyncTryCatch(async (req, res, next) => {
  const channelIdForVideos = req.params?.channelId;
  let { cursor, limit = 20, sortField = "_id", sortOrder = 1 } = req.query;

  sortOrder = parseInt(sortOrder);
  cursor = JSON.parse(cursor);
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

//✅✅ toggle bell *********************************************************************************
export const toggleBell = AsyncTryCatch(async (req, res, next) => {
  const { creatorId } = req.body;
  const subscription = await Subscription.findOne({
    subscriber: req.channelId,
    creator: creatorId,
  });

  if (!subscription)
    return next(new ErrorHandler(404, "Subscription not found"));

  subscription.bell = !subscription.bell;
  await subscription.save();

  res.status(200).json({ success: true });
});

//✅ get getSubscribedChannel *****************************************************************
export const getSubscribedChannel = AsyncTryCatch(async (req, res, next) => {
  const subs = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(req.channelId),
      },
    },
    {
      $lookup: {
        from: "channels",
        localField: "creator",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              _id: 1,
              channelName: 1,
              bio: 1,
              profilePhoto: 1,
              subscribersCount: 1,
              email: 1,
            },
          },
        ],
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
        bell: 1,
      },
    },
  ]);
  console.log("all ", subs.length);

  const invalidSubIds = subs // creator which have deleted their channels
    .filter((sub) => !sub.creator)
    .map((sub) => sub._id);

  if (invalidSubIds.length > 0) {
    await Subscription.deleteMany({ _id: { $in: invalidSubIds } });
  }
  console.log(subs[0]);
  res.status(200).json({ following: subs });
});

// start from here

//✅ get any channels playlist **********************************************************************************
export const getChannelPlaylists = AsyncTryCatch(async (req, res, next) => {
  const channelId = req.params?.channelId;
  // console.log("in get channel playlists ", channelId);

  let canSendPrivatePlaylist = false;
  const channelIdVisiting = LogedInChannel(req.cookies?.jwt);
  // console.log("channeld Id visiting ", channelIdVisiting);
  if (channelIdVisiting)
    canSendPrivatePlaylist =
      channelIdVisiting.toString() === channelId.toString();

  console.log("can send private playlists ", canSendPrivatePlaylist);

  const matchQuery = {
    channel: new mongoose.Types.ObjectId(channelId),
  };
  if (!canSendPrivatePlaylist) matchQuery.isPrivate = false;

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
  const { videoId } = req.params;
  const channelId = req.channelId;
  const playlists = await Playlist.find({ channel: channelId })
    .select("name isPrivate")
    .lean();

  const pv = (
    await PlaylistVideos.find({
      playlistId: { $in: playlists },
      videoId,
    }).lean()
  ).map((p) => String(p.playlistId));

  const dataToSend = playlists.map((pl) => ({
    ...pl,
    isPresent: pv.includes(String(pl._id)),
  }));
  console.log(dataToSend);

  res.status(200).json({ playlists: dataToSend });
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
  console.log("in get playlist");
  let { playlistId, cursor, limit = 20 } = req.query;
  console.log(playlistId, cursor, limit);
  cursor = JSON.parse(cursor);
  const parsedLimit = parseInt(limit);

  const query = { playlistId: new mongoose.Types.ObjectId(playlistId) };

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) return next(new ErrorHandler(400, "Missing playlistId"));
  console.log("playlist found", playlist);
  if (playlist.isPrivate) {
    const channelIdVisiting = LogedInChannel(req.cookies?.jwt);
    console.log("user ", channelIdVisiting);
    if (
      !channelIdVisiting ||
      channelIdVisiting.toString() !== playlist.channel.toString()
    )
      return next(new ErrorHandler(400, "Unauthorized request"));
  }
  console.log("moving forward");

  if (cursor) {
    query._id = {
      $lt: new mongoose.Types.ObjectId(cursor),
    };
  }
  console.log("query ", query);
  const playlistVideos = await PlaylistVideos.aggregate([
    { $match: query },
    { $sort: { _id: -1 } },
    { $limit: parsedLimit },
    {
      $lookup: {
        from: "videos",
        foreignField: "_id",
        localField: "videoId",
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
  console.log(playlistVideos.length);
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

  res.status(200).json({ playlist, videos, hasMore, nextCursor });
});

// remove single video from playlist *************************************************************
export const removeVideoFromPlaylist = AsyncTryCatch(async (req, res, next) => {
  const { videoId, playlistIds = [] } = req.body;
  console.log("in removing playlsit ", videoId, playlistIds);
  const videoRemoverId = req.channelId;

  const playlists = playlistIds.map((p) => new mongoose.Types.ObjectId(p));

  const playlistVideo = await PlaylistVideos.aggregate([
    {
      $match: {
        playlistId: { $in: playlists },
        videoId: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "playlists",
        foreignField: "_id",
        localField: "playlistId",
        as: "playlists",
      },
    },
    {
      $unwind: "$playlists",
    },
  ]);

  if (!playlistVideo.length) {
    return next(new ErrorHandler(400, "Video not found in playlist"));
  }
  // console.log(playlistVideo);
  const accessablePlaylistsVideos = [];

  playlistVideo.forEach((pv) => {
    if (videoRemoverId.toString() === pv.playlists.channel.toString())
      accessablePlaylistsVideos.push(pv._id);
  });

  // console.log(accessablePlaylistsVideos);
  await PlaylistVideos.deleteMany({ _id: { $in: accessablePlaylistsVideos } });
  decearseCountInPlaylist(videoRemoverId, playlists);
  return res.status(200).json({ success: true });
});

const decearseCountInPlaylist = async (videoRemoverId, playlists) => {
  try {
    await Playlist.updateMany(
      { _id: { $in: playlists }, channel: videoRemoverId },
      { $inc: { videosCount: -1 } }
    );
  } catch (error) {
    console.error("Failed to decrement playlist video count:", err);
  }
};
export const deletePlaylist = AsyncTryCatch(async (req, res, next) => {
  const { playlistId } = req.body;
  console.log("in here deleting playlsit", playlistId);
  const playlistDeleterId = req.channelId;

  const playlistDeleter = await Channel.findById(playlistDeleterId);

  if (!playlistDeleter)
    return next(new ErrorHandler(400, "Authorization Denied"));

  let canDeletePlaylist = true;
  if (
    playlistDeleter.permanentPlaylist.get("watchHistory").toString() ===
      playlistId ||
    playlistDeleter.permanentPlaylist.get("likedVideos").toString() ===
      playlistId ||
    playlistDeleter.permanentPlaylist.get("watchLater").toString() ===
      playlistId
  )
    canDeletePlaylist = false;

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) return next(new ErrorHandler(400, "Playlist not found"));

  if (playlistDeleterId !== playlist.channel.toString()) {
    return next(new ErrorHandler(400, "Authorization Denied"));
  }

  await PlaylistVideos.deleteMany({ playlistId });

  console.log("cna delte playlist ", canDeletePlaylist);
  if (canDeletePlaylist) await Playlist.deleteOne({ _id: playlistId });
  else await Playlist.updateOne({ _id: playlistId }, { videosCount: 0 });

  return res.status(200).json({ success: true });
});

//deleteing channel ******************************************************************************
export const deleteChannle = AsyncTryCatch(async (req, res, next) => {
  // TODO: to delete, all videos, playlists, playlistvideos, subs, setttings, notifications ,
});
