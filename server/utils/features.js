import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import cron from "node-cron";
import fs from "fs";
import path from "path";
// import Subscription from "../models/subscription.model";
import Setting from "../models/setting.model.js";
import Channel from "../models/channel.model.js";
import Playlist from "../models/playlist.model.js";
import PlaylistVideos from "../models/playlistVideos.js";
import Video from "../models/video.model.js";
import Subscription from "../models/subscription.model.js";

export const UploadSinglePhotoToCloudinary = async (req) => {
  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          folder: "ProfilePhoto", // Specify the Cloudinary folder
        },
        (error, result) => {
          if (error) {
            reject(error); // Reject the promise if there's an error
          } else {
            resolve(result); // Resolve the promise with the result
          }
        }
      );

      // Pipe the file buffer to the Cloudinary stream
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    console.log(result.secure_url.toString());
    console.log("Image uploaded successfully to Cloudinary");

    return result.secure_url.toString();
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    throw error; // Propagate the error to the calling function
  }
};

function getPublicIdFromUrl(url) {
  const regex = /\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/;
  const match = url.match(regex);

  return match ? match[1] : null;
}

function getManyPublicIdsFromUrls(urls) {
  const regex = /\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/;

  return urls
    .map((url) => {
      const match = url.match(regex);
      return match ? match[1] : null;
    })
    .filter(Boolean); // removes nulls
}

const deleteVideo = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(
      "your_video_public_id",
      { resource_type: "video" },
      function (error, result) {
        console.log(result, error);
      }
    );
    console.log("video deleted successfully");
  } catch (error) {
    console.log("didnt delete the video");
  }
};

export const deleteManyVideos = async (urls) => {
  try {
    const publicIds = getManyPublicIdsFromUrls(urls);
    await cloudinary.api.delete_resources(publicIds, {
      resource_type: "video",
    });
  } catch (error) {
    console.log("Error deleting videos:", error);
  }
};

export const deleteManyThumbnails = async (urls) => {
  try {
    const publicIds = getManyPublicIdsFromUrls(urls);
    await cloudinary.api.delete_resources(publicIds, {
      resource_type: "image",
    });
  } catch (error) {
    console.log("Error deleting thumbnails:", error);
  }
};

const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("Image deleted successfully:", result);
  } catch (error) {
    console.error("Error deleting image:", error);
  }
};

export async function deleteVideoFromCloudinary(url) {
  const publicId = getPublicIdFromUrl(url);
  await deleteVideo(publicId);
}

export async function deleteImageFromCloudinary(url) {
  const publicId = getPublicIdFromUrl(url);
  await deleteImage(publicId);
}

export const UpdateThumbnail = async (req) => {
  console.log("in uploading space");
  try {
    // Helper function to upload a single file
    const uploadFile = (file, options) =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          options,
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        streamifier.createReadStream(file.buffer).pipe(stream);
      });

    console.log("created Stream");
    // Upload the photo
    const photoResult = req.files?.thumbnail
      ? await uploadFile(req.files.thumbnail[0], {
        resource_type: "image",
        folder: "Thumbnails", // Store photos in 'Photos' folder
      })
      : null;
    console.log("photo uploaded");
    return {
      message: "thumbnail uploaded successfully",
      thumbnailUrlNew: photoResult?.secure_url || null,
    };
  } catch (error) {
    console.error("Error uploading files to Cloudinary:", error);
    throw error;
  }
};

export const UploadVideoAndThumbnail = async (req) => {
  console.log("in uploading space");
  try {
    // Helper function to upload a single file
    const uploadFile = (file, options) =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          options,
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        streamifier.createReadStream(file.buffer).pipe(stream);
      });

    console.log("created Stream");
    // Upload the photo
    const photoResult = req.files?.thumbnail
      ? await uploadFile(req.files.thumbnail[0], {
        resource_type: "image",
        folder: "Thumbnails", // Store photos in 'Photos' folder
      })
      : null;
    console.log("photo uploaded");
    // Upload the video
    const videoResult = req.files?.video
      ? await uploadFile(req.files.video[0], {
        resource_type: "video",
        folder: "Videos", // Store videos in 'Videos' folder
      })
      : null;
    console.log("video uplaoded");
    // Response with the uploaded file details
    return {
      message: "Files uploaded successfully",
      videoUrlNew: videoResult?.secure_url || null,
      thumbnailUrlNew: photoResult?.secure_url || null,
    };
  } catch (error) {
    console.error("Error uploading files to Cloudinary:", error);
    throw error;
  }
};

cron.schedule("0 1 * * *", async () => {
  console.log("🔁 Running midnight cleanup...");

  const filePath = path.join(__dirname, "..", "pendingDeletions.json");
  if (!fs.existsSync(filePath)) return;

  const data = fs.readFileSync(filePath, "utf-8");
  const pendingIds = JSON.parse(data);

  try {
    // Decrement subscriber counts for channels that were followed
    const mp = new Map();


    await Notification.deleteMany({ channel: { $in: pendingIds } });
    // console.log("notifications deleted for channel ", channelId);
    await Subscription.deleteMany({ creator: { $in: pendingIds } });
    // console.log("subscriptions deleted for channel ", channelId);
    const playlists = await Playlist.find({ channel: { $in: pendingIds } });
    const playlistIds = playlists.map((p) => p._id);

    const subscriptions = await Subscription.find({ subscriber: { $in: pendingIds } });
    subscriptions.forEach((s) => {
      const count = mp.get(s.creator) || 0;
      mp.set(s.creator, count + 1);
    });
    await Subscription.deleteMany({ subscriber: { $in: pendingIds } });
    // console.log("subscriptions deleted for channel ", channelId);

    await Promise.all(
      Array.from(mp.entries()).map(([creatorId, count]) =>
        Channel.updateOne(
          { _id: creatorId },
          { $inc: { subscriberCount: -count } }
        )
      )
    );
    await Playlist.deleteMany({ channel: { $in: pendingIds } });
    // console.log("playlists deleted for channel ", channelId);
    await PlaylistVideos.deleteMany({ playlistId: { $in: playlistIds } });
    // console.log("playlist videos deleted for channel ", channelId);

    const videos = await Video.find({ channel: { $in: pendingIds } });
    const videoIds = videos.map((v) => v._id);
    const videoUrls = videos.map((v) => v.videoUrl);
    const thumbnailUrls = videos.map((v) => v.thumbnailUrl);

    await Comment.deleteMany({ videoId: { $in: videoIds } });
    // console.log("comments deleted for channel ", channelId);
    await Video.deleteMany({ channel: { $in: pendingIds } });
    // console.log("videos deleted for channel ", channelId);


    await deleteManyVideos(videoUrls);
    // console.log("videos deleted for channel ", channelId);
    await deleteManyThumbnails(thumbnailUrls);
    // console.log("thumbnails deleted for channel ", channelId);

  }
  catch (err) {
    console.error("Error decrementing subscriber counts:", err);
  }

  // Clear file after all deletions
  fs.writeFileSync(filePath, JSON.stringify([], null, 2), "utf-8");
});
