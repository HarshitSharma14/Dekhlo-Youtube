import "dotenv/config";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import cloudinary from "cloudinary";

// importing Routes ******************************
import authRoutes from "./routes/auth.route.js";
import channelRoutes from "./routes/channel.route.js";
import videoRoutes from "./routes/video.route.js";

// Other Imports *********************************
import { errorHandlerMiddleware } from "./middlewares/error.middlewares.js";
import { getVideosForHomePage } from "./controllers/home.controller.js";
import { setupSocket } from "./socket.js";
import "./utils/features.js"; // Initialize cron jobs
import { optionalAuth } from "./middlewares/auth.middleware.js";

// localConstansts ************************************
const app = express();
const clientURL = process.env.CLIENT_URL;
const databaseURI = process.env.DATABASE_URI;
const databaseName = process.env.DATABASE_NAME;
const databaseURL = `${databaseURI}/${databaseName}`;
const corsOptions = {
  origin: `${clientURL}`, // Frontend URL
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // Methods you want to allow
  credentials: true,
};

// config ********************************************
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 60 * 60 * 1000 * 4,
});

// Middleware ******************************************
app.use(cors(corsOptions));
app.use(express.json({ limit: "100mb" })); // Adjust as needed, e.g., '50mb', '100mb', etc.
app.use(express.urlencoded({ limit: "100mb", extended: true }));

// App Routes ******************************************
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/channel", channelRoutes);
app.use("/api/v1/video", videoRoutes);

// Single Routes  ******************************
app.post("/api/v1/home/videos", optionalAuth, getVideosForHomePage);

app.get("/", async (_, res) => {
  res.status(200).json({
    message: "Home route working on the Youtube app",
  });
});

// Middleware to handle error ***************************
app.use(errorHandlerMiddleware);

// App starting *****************************************
const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);

  mongoose
    .connect(databaseURL, { autoIndex: true })
    .then(async () => {
      console.log("DB Connection success");
    })
    .catch((e) => console.log("DB Connection error: ", e.message));
});

setupSocket(server);
