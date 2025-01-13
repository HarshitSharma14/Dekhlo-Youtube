import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
console.log("just after");
dotenv.config();
// importing Routes ******************************
import { loginSignup } from "./controllers/auth.controller.js";
import authRoutes from "./routes/auth.route.js";
import channelRoutes from "./routes/channel.route.js";
import { JWT_SECRET } from "./utils/constants.js";

// localConstansts ************************************
const databaseURL = process.env.DATABASE_URL;
const app = express();
const corseOptions = {
  origin: "http://localhost:5173", // Frontend URL
  credentials: true,
};
const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const callbackURL = "http://localhost:3000/api/v1/auth/oauth2/redirect/google";

// Middleware ******************************************
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(cors(corseOptions));
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

// Home Route jsut to test ******************************
app.get("/", (_, res) => {
  console.log(JWT_SECRET);
  res.send("Home route working on the Youtube app");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);

  mongoose
    .connect(databaseURL)
    .then(() => console.log("DB Connection success"))
    .catch((e) => console.log("DB Connection error: ", e.message));
});
