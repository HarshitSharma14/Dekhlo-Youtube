import Channel from "../models/channel.model.js";
import {
  ErrorHandler,
  extractTokenFromRequest,
  verifyToken,
} from "../utils/utility.js";
import { AsyncTryCatch } from "./error.middlewares.js";

export const isUserLoggedIn = AsyncTryCatch(async (req, res, next) => {
  const token = extractTokenFromRequest(req);

  if (!token)
    return next(new ErrorHandler(401, "Please Login to access this resource"));
  const decodedData = verifyToken(token, "access");
  if (!decodedData) {
    return next(new ErrorHandler(401, "Invalid or expired token"));
  }
  const channel = await Channel.findById(decodedData.channelId);
  if (!channel) {
    return next(new ErrorHandler(404, "User not found"));
  }

  req.channelId = decodedData.channelId;
  next();
});

export const optionalAuth = AsyncTryCatch(async (req, res, next) => {
  try {
    const token = extractTokenFromRequest(req);

    if (!token) {
      // No token - user is anonymous
      req.channelId = undefined;
      return next();
    }

    const decodedData = verifyToken(token, "access");
    if (!decodedData) {
      // Token is expired or invalid - return specific status for frontend handling
      // 498 is a custom status code for "Token Expired/Invalid"
      return res.status(498).json({
        success: false,
        message: "Token expired or invalid",
        code: "TOKEN_EXPIRED",
      });
    }

    // Valid token - check if user still exists
    const channel = await Channel.findById(decodedData.channelId);
    if (!channel) {
      // User not found - treat as anonymous
      req.channelId = undefined;
      return next();
    }

    // Valid authenticated user
    req.channelId = decodedData.channelId;
    next();
  } catch (error) {
    // Any error - treat as anonymous
    req.channelId = undefined;
    next();
  }
});
