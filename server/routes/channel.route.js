import { Router } from "express";
import multer from "multer";
import {
  getChannelInfo,
  updateProfile,
  updateVideo,
} from "../controllers/channel.controller.js";
import { isUserLoggedIn } from "../middlewares/auth.middleware.js";

const app = Router();

// multer config ***************************************
const storage = multer.memoryStorage();
const upload = multer({
  limits: { fileSize: 100 * 1024 * 1024 }, // Limit size to 10MB
  storage: storage
});

// Routes **********************************************
app.get("/get-info", getChannelInfo);
app.post(
  "/update-profile",
  isUserLoggedIn,
  upload.single("profilePhotoFile"),
  updateProfile
);
app.post("/update-videoinfo", isUserLoggedIn, upload.fields([{ name: 'video' }, { name: 'thumbnail' }]),
  updateVideo);
export default app;
// upload.fields([{ name: 'video' }, { name: 'thumbnail' }]),