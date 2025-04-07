import { Router } from "express";
import multer from "multer";
import {
  addVideosToPlaylist,
  changeIsread,
  getChannelInfo,
  getChannelPlaylists,
  getChannelVideos,
  getNotifications,
  getMyPlaylists,
  getPlaylistVideos,
  getSelfChannelInfo,
  getSubscribedChannel,
  getSubscribedChannelVideos,
  getWatchHistory,
  subscribeChannel,
  toggleBell,
  unSubscribeChannel,
  updateProfile,
  updateVideo,
} from "../controllers/channel.controller.js";
import { isUserLoggedIn } from "../middlewares/auth.middleware.js";

const app = Router();

// multer config ***************************************
const upload = multer({ storage: multer.memoryStorage() });
// const upload = multer({
//   limits: { fileSize: 100 * 1024 * 1024 }, // Limit size to 10MB
//   storage: storage
// });

// Routes **********************************************
app.get("/get-info", isUserLoggedIn, getSelfChannelInfo);
app.get("/get-info/:channelId", getChannelInfo);
app.get("/playlists/:channelId", getChannelPlaylists);
app.get("/videos/:channelId", getChannelVideos);
app.get("/playlist", getPlaylistVideos);

// login required routes ****************************************
app.use(isUserLoggedIn);
app.get("/myplaylist", getMyPlaylists);
app.get("/get-subscribedchannels", getSubscribedChannel);
app.post("/add-to-playlist", addVideosToPlaylist);
app.post("/update-profile", upload.single("profilePhotoFile"), updateProfile);
app.post("/subscribe", subscribeChannel);
app.delete("/unsubscribe", unSubscribeChannel);
app.get("/change-isread", changeIsread);
app.patch("/toggle-bell", toggleBell);
app.get("/subscription/videos", getSubscribedChannelVideos);
app.get("/watch-history", getWatchHistory);
app.get("/get-notifications", getNotifications);
app.post(
  "/update-videoinfo",
  upload.fields([{ name: "video" }, { name: "thumbnail" }]),
  updateVideo
);

export default app;
// upload.fields([{ name: 'video' }, { name: 'thumbnail' }]),
