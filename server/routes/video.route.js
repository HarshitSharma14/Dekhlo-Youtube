import { Router } from "express";
import {
  getVideo,
  getPlayNext,
  getVideoDetails,
  likeUnlikeVideo,
  getComments,
  putComment,
} from "../controllers/video.controller.js";
import { isUserLoggedIn } from "../middlewares/auth.middleware.js";
//liking video , commenting , view count , update video info

const app = Router();

app.get("/video-details/:videoId", getVideoDetails);
app.get("/get-video/:videoId", getVideo);
app.get("/get-play-next/:videoId", getPlayNext);
app.get("/get-comments/:videoId", getComments);
app.use(isUserLoggedIn);

app.post("/put-comment/:videoId", putComment);
app.patch("/like-unlike/:videoId", likeUnlikeVideo);

export default app;
