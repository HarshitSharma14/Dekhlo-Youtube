import { Router } from "express";
import multer from "multer";
import {
  createNewPlaylist,
  getChannelInfo,
  getSubscribedChannelVideos,
  getWatchHistory,
  subscribeChannel,
  unSubscribeChannel,
  updateProfile,
} from "../controllers/channel.controller.js";
import { isUserLoggedIn } from "../middlewares/auth.middleware.js";

const app = Router();

// multer config ***************************************
const upload = multer({ storage: multer.memoryStorage() });

// Routes **********************************************
app.get("/get-info", getChannelInfo);

// login required routes ****************************************
app.use(isUserLoggedIn);
app.post("/update-profile", upload.single("profilePhotoFile"), updateProfile);
app.post("/upload-video", () => {});
app.post("/subscribe", subscribeChannel);
app.delete("/unsubscribe/:creatorId", unSubscribeChannel);
app.get("/subscription/videos", getSubscribedChannelVideos);
app.get("/watch-history", getWatchHistory);
app.post("/create-playlist", createNewPlaylist);

export default app;
