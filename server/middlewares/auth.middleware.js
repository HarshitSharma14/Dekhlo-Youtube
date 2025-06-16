import Channel from "../models/channel.model.js";
import { JWT_SECRET } from "../utils/constants.js";
import { ErrorHandler } from "../utils/utility.js";
import { AsyncTryCatch } from "./error.middlewares.js";
import jwt from "jsonwebtoken";

export const isUserLoggedIn = AsyncTryCatch(async (req, res, next) => {
  const token = req.cookie.jwt; // just check wheather it is cookie of cookies
  console.log("token ", token);
  if (!token)
    return next(new ErrorHandler(401, "Please Login to access this resource"));

  const decodedData = jwt.verify(token, JWT_SECRET);
  const channel = await Channel.findById(decodedData.channelId);
  if (!channel) {
    return next(new ErrorHandler(404, "User not found"));
  }
  req.channelId = decodedData.channelId;
  console.log("User is logged in");
  next();
});
