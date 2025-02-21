import { Router } from "express";
import {
  getVideo,
  getVideoDetails,
  likeUnlikeVideo,
} from "../controllers/video.controller.js";
import { isUserLoggedIn } from "../middlewares/auth.middleware.js";
//liking video , commenting , view count , update video info

const app = Router();

app.get("/video-details/:videoId", getVideoDetails);
app.get("/get-video/:videoId", getVideo);

app.use(isUserLoggedIn);
app.patch("/like-unlike/:videoId", likeUnlikeVideo);

export default app;
