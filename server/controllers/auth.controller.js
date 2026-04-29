import { compare } from "bcrypt";
import Channel from "../models/channel.model.js";
import Playlist from "../models/playlist.model.js";
import Setting from "../models/setting.model.js";
import { AsyncTryCatch } from "../middlewares/error.middlewares.js";
import {
  ErrorHandler,
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} from "../utils/utility.js";

export const logout = async (req, res) => {
  const channelId = req.channelId;
  await Channel.findByIdAndUpdate(channelId, {
    refreshToken: null,
    refreshTokenExpiresAt: null,
  });

  res.status(200).json({ message: "Logged out successfully." });
};

export const login = AsyncTryCatch(async (req, res, next) => {
  const { email, password } = req.body;

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

  const auth = await compare(password, channel.password);

  if (!auth) {
    return next(new ErrorHandler(401, "Invalid Email or Password"));
  }

  const userObj = channel.toObject();
  delete userObj.password;

  // Generate both tokens
  const accessToken = generateAccessToken(channel._id);
  const refreshToken = generateRefreshToken(channel._id);

  // Store refresh token in database
  channel.refreshToken = refreshToken;
  channel.refreshTokenExpiresAt = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000
  ); // 7 days
  await channel.save();

  return res.status(200).json({
    message: "Login successful",
    accessToken,
    refreshToken,
    channel: userObj,
  });
});

export const googleLogin = AsyncTryCatch(async (req, res, next) => {
  const { accessToken } = req.body;
  if (!accessToken) {
    return next(new ErrorHandler(400, "Access token is required"));
  }

  try {
    // For frontend OAuth, we'll use the access token to get user info from Google
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`
    );

    if (!response.ok) {
      return next(
        new ErrorHandler(400, "Failed to fetch user info from Google")
      );
    }

    const userData = await response.json();
    const { email, name, picture } = userData;

    if (!email) {
      return next(
        new ErrorHandler(400, "Google account does not have an email")
      );
    }

    let profileAlreadyExist = true;
    let channel = await Channel.findOne({ email });

    if (!channel) {
      // Create new channel
      channel = new Channel({
        channelName: name || "Unnamed Channel",
        email: email,
        profilePhoto: picture || "",
      });

      channel.permanentPlaylist = new Map();
      const settings = new Setting();
      await settings.save();
      channel.settings = settings._id;

      // Create default playlists
      const watchLater = await Playlist.create({
        name: "Watch later",
        channel: channel._id,
        videoCount: 0,
        private: true,
      });

      const watchHistory = await Playlist.create({
        name: "Watch History",
        channel: channel._id,
        videoCount: 0,
        private: true,
      });

      const likedVideos = await Playlist.create({
        name: "Liked Videos",
        channel: channel._id,
        videoCount: 0,
        private: true,
      });

      channel.permanentPlaylist.set("watchLater", watchLater._id);
      channel.permanentPlaylist.set("watchHistory", watchHistory._id);
      channel.permanentPlaylist.set("likedVideos", likedVideos._id);

      await channel.save();
      profileAlreadyExist = false;
    }

    // Generate both tokens
    const newAccessToken = generateAccessToken(channel._id);
    const newRefreshToken = generateRefreshToken(channel._id);

    // Store refresh token in database
    channel.refreshToken = newRefreshToken;
    channel.refreshTokenExpiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ); // 7 days
    await channel.save();

    res.status(200).json({
      message: "Google login successful",
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      channel: {
        _id: channel._id,
        channelName: channel.channelName,
        email: channel.email,
        profilePhoto: channel.profilePhoto,
        permanentPlaylist: channel.permanentPlaylist,
        bio: channel.bio,
        followers: channel.subscribersCount,
        videos: channel.videosCount,
        views: channel.views,
      },
    });
  } catch (error) {
    return next(new ErrorHandler(400, "Google login failed"));
  }
});

/**
 * Refresh access token using refresh token
 * Also generates new refresh token if current one is close to expiring
 */
export const refreshToken = AsyncTryCatch(async (req, res, next) => {
  const { refreshToken: clientRefreshToken } = req.body;

  if (!clientRefreshToken) {
    return next(new ErrorHandler(400, "Refresh token is required"));
  }

  try {
    // Verify refresh token
    const decodedData = verifyToken(clientRefreshToken, "refresh");
    if (!decodedData) {
      return next(new ErrorHandler(401, "Invalid or expired refresh token"));
    }

    // Find channel and verify token
    const channel = await Channel.findById(decodedData.channelId);
    if (!channel || channel.refreshToken !== clientRefreshToken) {
      return next(new ErrorHandler(401, "Invalid refresh token"));
    }

    // Check if refresh token is expired
    if (channel.refreshTokenExpiresAt < new Date()) {
      return next(new ErrorHandler(401, "Refresh token expired"));
    }

    // Check if refresh token is close to expiring (less than 1 day left)
    const oneDayFromNow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const shouldRefreshRefreshToken =
      channel.refreshTokenExpiresAt <= oneDayFromNow;

    let newRefreshToken = clientRefreshToken;
    let newRefreshTokenExpiry = channel.refreshTokenExpiresAt;

    if (shouldRefreshRefreshToken) {
      newRefreshToken = generateRefreshToken(channel._id);
      newRefreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      // Update database
      channel.refreshToken = newRefreshToken;
      channel.refreshTokenExpiresAt = newRefreshTokenExpiry;
      await channel.save();
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(channel._id);

    res.status(200).json({
      message: "Token refreshed successfully",
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      refreshTokenRefreshed: shouldRefreshRefreshToken,
    });
  } catch (error) {
    return next(new ErrorHandler(500, "Failed to refresh token"));
  }
});
