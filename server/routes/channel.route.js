import { Router } from "express";
import multer from "multer";
import {
  createNewPlaylist,
  getChannelInfo,
  getChannelPlaylists,
  getChannelVideos,
  getSubscribedChannelVideos,
  getWatchHistory,
  subscribeChannel,
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
app.get("/get-info", isUserLoggedIn, getChannelInfo);
app.get("/get-info/:channelId", getChannelInfo);
app.get("/playlists/:channelId", getChannelPlaylists);
app.get("/videos/:channelId", getChannelVideos);

// login required routes ****************************************
app.use(isUserLoggedIn);
app.post("/update-profile", upload.single("profilePhotoFile"), updateProfile);
app.post("/subscribe", subscribeChannel);
app.delete("/unsubscribe/:creatorId", unSubscribeChannel);
app.get("/subscription/videos", getSubscribedChannelVideos);
app.get("/watch-history", getWatchHistory);
app.post("/create-playlist", createNewPlaylist);
app.post(
  "/update-videoinfo",
  upload.fields([{ name: "video" }, { name: "thumbnail" }]),
  updateVideo
);

export default app;
// upload.fields([{ name: 'video' }, { name: 'thumbnail' }]),
