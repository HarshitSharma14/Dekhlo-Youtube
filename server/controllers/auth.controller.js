import jwt from "jsonwebtoken";
import { compare } from "bcrypt";
import Channel from "../models/channel.model.js";
import { JWT_SECRET } from "../utils/constants.js";
import { AsyncTryCatch } from "../middlewares/error.middlewares.js";
import { ErrorHandler } from "../utils/utility.js";
import Playlist from "../models/playlist.model.js";
import Setting from "../models/setting.model.js";

// constants ******************************************************
const clientURL = process.env.CLIENT_URL;
const maxAge = 24 * 60 * 60 * 1000;


// ✅✅
export const loginSignup = async (accessToken, refreshToken, profile, cb) => {
  try {
    const email = profile.emails[0]?.value; // Extract email from Google profile

    if (!email) {
      return cb(null, false, {
        message: "Google account does not have an email.",
      });
    }
    let profileAlreadyExist = true;
    // Check if a channel with this email already exists
    let channel = await Channel.findOne({ email });

    if (!channel) {
      // If no channel exists, create a new one
      channel = new Channel({
        channelName: profile.displayName || "Unnamed Channel",
        email: email,
        profilePhoto: profile.photos[0]?.value || "", // Google profile picture
      });

      channel.permanentPlaylist = new Map();
      const settings = new Setting()
      await settings.save()
      channel.settings = settings._id;

      const watchLater = await Playlist.create({
        name: "Watch later",
        channel: channel._id,
        videoCount: 0,
        private: true,
      });

      channel.permanentPlaylist.set("watchLater", watchLater._id);
      const watchHistory = await Playlist.create({
        name: "Watch History",
        channel: channel._id,
        videoCount: 0,
        private: true,
      });
      channel.permanentPlaylist.set("watchHistory", watchHistory._id);
      const likedVideos = await Playlist.create({
        name: "Liked Videos",
        channel: channel._id,
        videoCount: 0,
        private: true,
      });
      channel.permanentPlaylist.set("likedVideos", likedVideos._id);
      await channel.save();

      console.log("channel info: ", channel);
      profileAlreadyExist = false;
    }

    // Generate JWT for the channel
    const token = jwt.sign(
      { channelId: channel._id },
      JWT_SECRET,
      { expiresIn: maxAge } // Token expires in 1 hour
    );

    // console.log(token);
    return cb(null, { token, profileAlreadyExist });
  } catch (err) {
    return cb(err);
  }
};

export const oauth2_redirect = (req, res) => {
  if (!req.user || !req.user.token) {
    return res.redirect(`${clientURL}`);
  }
  const token = req.user.token;
  const profileAlreadyExist = req.user.profileAlreadyExist;

  console.log("in the func");

  // Set the token as an HTTP-only cookie
  res.cookie("jwt", token, {
    httpOnly: true,
    sameSite: "None",
    secure: true,
  });
  if (!profileAlreadyExist) res.redirect(`${clientURL}/profile-setup`);
  else res.redirect(`${clientURL}`);
};

export const logout = (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    sameSite: "None",
    secure: true,
    expires: new Date(0), // Explicitly expire the cookie
  });
  console.log("LOGOUT");
  res.status(200).json({ message: "Logged out successfully." });
};

export const login = AsyncTryCatch(async (req, res, next) => {
  const { email, password } = req.body;

  console.log(req.body);
  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "Invalid input format" });
  }
  if (!email || !password) {
    return next(new ErrorHandler(400, "Please enter both email and password"));
  }

  const channel = await Channel.findOne({ email }).select("+password");

  if (!channel) {
    return next(new ErrorHandler(404, "User does not exist"));
  }
  console.log("chnnel found ", channel);
  console.log(channel.password);

  console.log("andr hu uske");

  const auth = await compare(password, channel.password);

  console.log("thoda aur andr hu uske");
  if (!auth) {
    return next(new ErrorHandler(401, "Invalid Email or Password"));
  }
  console.log("thoda sa aur andr hu uske");
  const userObj = channel.toObject();

  console.log("bohot andr hu uske");

  delete userObj.password;

  const token = jwt.sign({ channelId: channel._id }, JWT_SECRET, {
    expiresIn: maxAge,
  });
  console.log(token);
  console.log("bohot zyada hi andr hu uske");

  res.cookie("jwt", token, {
    httpOnly: true,
    sameSite: "None",
    secure: true,
  });

  console.log("bohot zyada hi hi andr hu uske");
  return res.status(200).send(userObj);
});
