import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import passport from "passport";
import cloudinary from "cloudinary";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

// importing Routes ******************************
import authRoutes from "./routes/auth.route.js";
import channelRoutes from "./routes/channel.route.js";
import videoRoutes from "./routes/video.route.js";

// Other Imports *********************************
import { loginSignup } from "./controllers/auth.controller.js";
import { JWT_SECRET } from "./utils/constants.js";
import { errorHandlerMiddleware } from "./middlewares/error.middlewares.js";
import { getVideosForHomePage } from "./controllers/home.controller.js";
import { setupSocket } from "./socket.js";
import Channel from "./models/channel.model.js";
import Setting from "./models/setting.model.js";

// localConstansts ************************************
const app = express();
const clientURL = process.env.CLIENT_URL;
const serverURL = process.env.SERVER_URL;
const databaseURL = process.env.DATABASE_URL;
const corsOptions = {
  origin: `${clientURL}`, // Frontend URL
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // Methods you want to allow
  credentials: true,
};
const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const callbackURL = `${serverURL}/api/v1/auth/oauth2/redirect/google`;

// config ********************************************
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 60 * 60 * 1000 * 4,
});

// Middleware ******************************************
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(cors(corsOptions));
app.use(express.json({ limit: "100mb" })); // Adjust as needed, e.g., '50mb', '100mb', etc.
app.use(express.urlencoded({ limit: "100mb", extended: true }));

passport.use(
  new GoogleStrategy(
    {
      clientID,
      clientSecret,
      callbackURL,
    },
    loginSignup
  )
);

// App Routes ******************************************
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/channel", channelRoutes);
app.use("/api/v1/video", videoRoutes);

// Single Routes  ******************************
app.post("/api/v1/home/videos", getVideosForHomePage);

app.get("/", (_, res) => {
  console.log(JWT_SECRET);
  res.send("Home route working on the Youtube app");
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
      console.log("DB Connection success")
    })
    .catch((e) => console.log("DB Connection error: ", e.message));
});


setupSocket(server)
