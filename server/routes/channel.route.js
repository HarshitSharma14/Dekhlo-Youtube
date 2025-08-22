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
  subscribeChannel,
  toggleBell,
  unSubscribeChannel,
  updateProfile,
  updateVideo,
  removeVideoFromPlaylist,
  deletePlaylist,
  deleteChannel,
} from "../controllers/channel.controller.js";
import {
  isUserLoggedIn,
  optionalAuth,
} from "../middlewares/auth.middleware.js";

const app = Router();

// multer config ***************************************
const upload = multer({ storage: multer.memoryStorage() });
// const upload = multer({
//   limits: { fileSize: 100 * 1024 * 1024 }, // Limit size to 10MB
//   storage: storage
// });

// Routes **********************************************
app.get("/get-info", isUserLoggedIn, getSelfChannelInfo);
app.get("/get-info/:channelId", optionalAuth, getChannelInfo);
app.get("/playlists/:channelId", optionalAuth, getChannelPlaylists);
app.get("/videos/:channelId", optionalAuth, getChannelVideos);
app.get("/playlist", optionalAuth, getPlaylistVideos);

// login required routes ****************************************
app.use(isUserLoggedIn);
app.delete("/delete-channel", deleteChannel);
app.get("/myplaylist/:videoId", getMyPlaylists);
app.get("/get-subscribedchannels", getSubscribedChannel);
app.post("/add-to-playlist", addVideosToPlaylist);
app.delete("/remove-from-playlist", removeVideoFromPlaylist);
app.delete("/delete-playlist", deletePlaylist);
app.post("/update-profile", upload.single("profilePhotoFile"), updateProfile);
app.post("/subscribe", subscribeChannel);
app.delete("/unsubscribe", unSubscribeChannel);
app.get("/change-isread", changeIsread);
app.patch("/toggle-bell", toggleBell);
app.get("/get-notifications", getNotifications);
app.post(
  "/update-videoinfo",
  upload.fields([{ name: "video" }, { name: "thumbnail" }]),
  updateVideo
);

export default app;
