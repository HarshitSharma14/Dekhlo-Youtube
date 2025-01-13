import { Router } from "express";
import multer from "multer";
import { getChannelInfo } from "../controllers/channel.controller.js";
const app = Router();

const multerUpload = multer({
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

app.get("/get-info", getChannelInfo);

app.post(
  "/update-profile",
  multerUpload.single("profilePhotoFile"),
  (req, res) => {
    if (!req.file) console.log("google use kar");
    else console.log("file use kar");
    // console.log(req.body);
    res.status(400).json({ message: "backend error" });
  }
);

export default app;
