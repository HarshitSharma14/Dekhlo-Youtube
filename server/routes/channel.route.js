import { Router } from "express";
import multer from "multer";
import {
  getChannelInfo,
  updateProfile,
} from "../controllers/channel.controller.js";
import { isUserLoggedIn } from "../middlewares/auth.middleware.js";

const app = Router();

// multer config ***************************************
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Routes **********************************************
app.get("/get-info", getChannelInfo);
app.post(
  "/update-profile",
  isUserLoggedIn,
  upload.single("profilePhotoFile"),
  updateProfile
);
app.post("/upload-video", isUserLoggedIn);

export default app;
