import { Router } from "express";
import { getVideo, likeUnlikeVideo } from "../controllers/video.controller.js";
import { isUserLoggedIn } from "../middlewares/auth.middleware.js";
//liking video , commenting , view count , update video info

const app = Router();

app.post("/:videoId", getVideo);

app.use(isUserLoggedIn);
app.patch("/like-unlike/:videoId", likeUnlikeVideo);

export default app;
