import { JWT_SECRET } from "../utils/constants.js";
import { ErrorHandler } from "../utils/utility.js";
import { AsyncTryCatch } from "./error.middlewares.js";
import jwt from "jsonwebtoken";

export const isUserLoggedIn = AsyncTryCatch((req, res, next) => {
  const token = req.cookies.jwt;
  if (!token)
    return next(new ErrorHandler(401, "Please Login to access this resource"));

  const decodedData = jwt.verify(token, JWT_SECRET);
  // console.log(decodedData);
  req.channelId = decodedData.channelId;
  console.log("exiting middleware")
  next();
});
