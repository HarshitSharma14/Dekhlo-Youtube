import { Router } from "express";
import {
  getVideo,
  getVideoDetails,
  likeUnlikeVideo,
  getComments,
  putComment,
  getWatchNext,
  searchVideo,
  autoComplete,
} from "../controllers/video.controller.js";
import { isUserLoggedIn } from "../middlewares/auth.middleware.js";
//liking video , commenting , view count , update video info

const app = Router();

app.get("/search-video", searchVideo)
app.get("/autocomplete", autoComplete);
app.get("/video-details/:videoId", getVideoDetails);
app.get("/get-video/:videoId", getVideo);
app.get("/get-comments/:videoId", getComments);
app.get("/get-watch-next/:videoId", getWatchNext);

app.use(isUserLoggedIn);
app.post("/put-comment/:videoId", putComment);
app.patch("/like-unlike/:videoId", likeUnlikeVideo);

export default app;
