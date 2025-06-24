import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./constants.js";

export class ErrorHandler extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const sortByKey = (arr, key, order = "desc") => {
  return arr.sort((a, b) => {
    if (typeof a[key] === "string") {
      return order === "desc"
        ? b[key].localeCompare(a[key])
        : a[key].localeCompare(b[key]);
    }
    return order === "desc" ? b[key] - a[key] : a[key] - b[key];
  });
};


export const LogedInChannel = (token) => {
  try {
    const decodedData = jwt.verify(token, JWT_SECRET);
    const channelIdVisiting = decodedData.channelId;
    return channelIdVisiting;

  } catch (error) {
    console.log("User not logged in");
    return null;
  }
};
