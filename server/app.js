import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import passport from "passport";
import cloudinary from "cloudinary";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
console.log("just after");
dotenv.config();

// importing Routes ******************************
import authRoutes from "./routes/auth.route.js";
import channelRoutes from "./routes/channel.route.js";

// Other Imports *********************************
import { loginSignup } from "./controllers/auth.controller.js";
import { JWT_SECRET } from "./utils/constants.js";
import { errorHandlerMiddleware } from "./middlewares/error.middlewares.js";
import { getVideosForHomePage } from "./controllers/home.controller.js";

// localConstansts ************************************
const databaseURL = process.env.DATABASE_URL;
const app = express();
const corsOptions = {
  origin: "http://localhost:5173", // Frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Methods you want to allow
  credentials: true,
};
const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const callbackURL = "http://localhost:3000/api/v1/auth/oauth2/redirect/google";

// config ********************************************
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Middleware ******************************************
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(cors(corsOptions));
app.use(express.json({ limit: '100mb' })); // Adjust as needed, e.g., '50mb', '100mb', etc.
app.use(express.urlencoded({ limit: '100mb', extended: true }));

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

// Single Routes  ******************************
app.get("/api/v1/home/videos", getVideosForHomePage);

app.get("/", (_, res) => {
  console.log(JWT_SECRET);
  res.send("Home route working on the Youtube app");
});

// Middleware to handle error ***************************
app.use(errorHandlerMiddleware);

// App starting *****************************************
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);

  mongoose
    .connect(databaseURL)
    .then(() => console.log("DB Connection success"))
    .catch((e) => console.log("DB Connection error: ", e.message));
});
