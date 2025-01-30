import Channel from "../models/channel.model.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../utils/constants.js";
import { AsyncTryCatch } from "../middlewares/error.middlewares.js";
import {
  UpdateThumbnail,
  UploadSinglePhotoToCloudinary,
  UploadVideoAndThumbnail,
} from "../utils/features.js";
import { ErrorHandler, sortByKey } from "../utils/utility.js";
import Subscription from "../models/subscription.model.js";
import Video from "../models/video.model.js";
import Playlist from "../models/playlist.model.js";
import { v2 as cloudinary } from "cloudinary";

// const JWT_SECRET = process.env.JWT_SECRET || "default-secret";
// console.log(JWT_SECRET);

export const getChannelInfo = AsyncTryCatch(async (req, res, next) => {
  // is is neccessory to logged in to access this come later on this (TO BE CHANGED ) ****************************** <<--
  const { channelId } = req.params;
  let isOwner = false;
  let isSubscribed = false;
  let channelIdVisiting = null;

  try {
    const token = req.cookies.jwt;
    const decodedData = jwt.verify(token, JWT_SECRET);
    channelIdVisiting = decodedData.channelId;
    if (channelIdVisiting.toString() == channelId.toString()) {
      isOwner = true;
    }
  } catch (error) {
    console.log("cant send private videos");
  }
  const channel = await Channel.findById(channelId).select(
    "channelName email profilePhoto bio coverImage followers videos views"
  );

  if (channelIdVisiting && !isOwner) {
    isSubscribed = await Subscription.findOne({
      subscriber: channelIdVisiting,
      creator: channelId,
    });
  }
  // console.log(channel);
  if (!channel) next(new ErrorHandler(404, "Channel not found"));

  const dataToSend = {
    channelName: channel.channelName,
    email: channel.email,
    profilePhoto: channel.profilePhoto,
    bio: channel.bio,
    coverImage: channel.coverImage,
    followers: channel.followers.length,
    videos: channel.videos.length,
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
  );

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
  });

  if (isSubsriptionAlreadyExist)
    return next(new ErrorHandler(400, "User already subscribed"));

  const newSubscription = new Subscription({
    subscriber: req.channelId,
    creator: creatorId,
    bell: true,
  });

  await newSubscription.save();

  channelToBeSubscribed.followers.push(newSubscription._id);
  await channelToBeSubscribed.save();

  await Channel.findByIdAndUpdate(req.channelId, {
    $push: { following: newSubscription._id },
  });

  return res.status(200).json({ message: "Channel subscribed successfully" });
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
  });

  if (!subscription)
    return next(new ErrorHandler(400, "User already unsubscribed"));

  channelToBeUnSubscribed.followers = channelToBeUnSubscribed.followers.filter(
    (id) => !id.equals(subscription._id)
  );
  await channelToBeUnSubscribed.save();

  await Channel.findByIdAndUpdate(req.channelId, {
    $pull: { following: subscription._id },
  });

  return res.status(200).json({ message: "Channel unsubscribed successfully" });
});

// get VideosFromSubscribedChannel ****************************
export const getSubscribedChannelVideos = AsyncTryCatch(
  async (req, res, next) => {
    const { page = 1, limit = 20 } = req.query;
    const totalVideoCount = await Video.countDocuments();
    const totalPages = Math.ceil(totalVideoCount / limit) || 0;

    const channel = await Channel.findById(req.channelId).populate("following");

    const videos = await Video.find({
      channel: {
        $in: channel.following.map((follow) => follow.creator),
      },
      isPrivate: {
        $nin: true,
      },
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("channel", "channelName");

    return res
      .status(200)
      .json({ videos, totalPages, message: "fetched successfully" });
  }
);

// get watch history **********************************************
export const getWatchHistory = AsyncTryCatch(async (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;

  const channel = await Channel.findById(req.channelId).populate(
    "watchHistory"
  );

  const totalVideoCount = channel.watchHistory.length;
  const totalPages = Math.ceil(totalVideoCount / limit) || 0;

  let videosToSend = [];
  for (
    let i = (page - 1) * limit;
    i < page * limit && i < totalVideoCount;
    i++
  ) {
    videosToSend.push(channel.watchHistory[i]);
  }
  res.status(200).json({ videos: videosToSend, totalPages });
});

// creating new playlist ************************************************************************************8
export const createNewPlaylist = AsyncTryCatch(async (req, res, next) => {
  const { name, videos = [], isPrivate = true } = req.body;
  if (videos.length < 1)
    return next(new ErrorHandler(400, "Playlist cannot be empty"));

  const numberOfVideos = videos.length;
  const newPlaylist = new Playlist({
    name,
    videos,
    numberOfVideos,
    private: isPrivate,
  });

  await newPlaylist.save();

  await Channel.findOneAndUpdate(req.channelId, {
    $push: { playlist: newPlaylist },
  });
  res.status(200).json({ message: "Playlist created successfully" });
});

export const updateVideo = AsyncTryCatch(async (req, res, next) => {
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
  let videoIfAvailable = null
  if (videoId) {
    videoIfAvailable = await Video.findById(videoId)
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
  console.log("inside3")

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

  const channel = await Channel.findById(channelId);
  channel.videos.push(videonew._id);
  await channel.save();

  return res
    .status(201)
    .json({ message: "Video uploaded successfully", videonew });
});

// get Channel Videoss *********************************************************************************
export const getChannelVideos = AsyncTryCatch(async (req, res, next) => {
  const channelIdForVideos = req.params.channelId;
  const { page = 0, limit = 20, sort = "createdAt_desc" } = req.query;
  let canSendPrivateVideos = false;
  console.log("get channel page and sort", page, sort);
  const channelToFetchVideosFrom = await Channel.findById(
    channelIdForVideos
  ).populate("videos");
  if (!channelToFetchVideosFrom) {
    return next(new ErrorHandler(404, "Channel not found"));
  }

  // checking wheather the user asking for the videos can access the private videos

  try {
    const token = req.cookies.jwt;
    const decodedData = jwt.verify(token, JWT_SECRET);
    const channelIdVisiting = decodedData.channelId;
    if (channelIdVisiting.toString() == channelIdForVideos.toString()) {
      canSendPrivateVideos = true;
    }
  } catch (error) {
    console.log("cant send private videos");
  }
  let videosCanBeSent = channelToFetchVideosFrom.videos.filter(
    (vid) => !vid.isPrivate || canSendPrivateVideos
  );

  const [sortField, sortDirection] = sort.split("_"); // splits the sort string in the query parameter and takes the first two subarray from it and assign it to the corresponding variable

  const sortedVideos = sortByKey(videosCanBeSent, sortField, sortDirection); // function created in utitlity.js file can take name_acs, name_desc , views_acs, ...,createdAt_asc

  const startingIndex = parseInt(page, 10) * parseInt(limit, 10);

  let videosToSend = sortedVideos.slice(
    startingIndex,
    startingIndex + parseInt(limit, 10)
  );

  const totalPages = Math.ceil(sortedVideos.length / limit) || 0;
  res.status(200).json({
    message: "videos fetched successfully",
    totalPages,
    videos: videosToSend,
  });
});

// get playlist **********************************************************************************
export const getChannelPlaylists = AsyncTryCatch(async (req, res, next) => {
  const { channelId } = req.params;

  let canSendPrivatePlaylist = false;
  try {
    const token = req.cookies.jwt;
    const decodedData = jwt.verify(token, JWT_SECRET);
    const channelIdVisiting = decodedData.channelId;
    if (channelIdVisiting.toString() == channelId.toString()) {
      canSendPrivatePlaylist = true;
    }
  } catch (error) {
    console.log("cant send private playlist");
  }
  const x = await Channel.findById(channelId);
  // console.log("in playlist ", x);
  const channel = await Channel.findById(channelId)
    .select("playlists")
    .populate({
      path: "playlists",
      select: "name playlists",
      populate: {
        path: "videos",
        select: "thumbnailUrl",
      },
    })
    .sort({ updatedAt: -1 })
    .exec();

  if (!channel) return next(new ErrorHandler(404, "Channel not found"));

  let playlists = channel.playlists;

  if (!canSendPrivatePlaylist) {
    playlists = playlists.filter((plist) => plist.isPrivate != true);
  }

  const dataToSend = playlists.map((plist) => {
    const videoCount = plist.videos.length;
    const vids = plist.videos.slice(0, 3); // only neccessory  the top three videos
    return { ...plist, videos: vids, videoCount };
  });

  res.status(200).json({ playlists: dataToSend });
});

// toggle bell *********************************************************************************
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
