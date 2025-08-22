import jwt from "jsonwebtoken";
import {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
} from "./constants.js";

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
    return order === "desc" ? b[key] - a[key] : b[key] - a[key];
  });
};

/**
 * Extracts JWT token from request Authorization header
 * @param {Object} req - Express request object
 * @returns {string|null} - JWT token or null if not found
 */
export const extractTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  return null;
};

/**
 * Generates an access token (short-lived)
 * @param {string} channelId - Channel ID to encode in token
 * @returns {string} - JWT access token
 */
export const generateAccessToken = (channelId) => {
  return jwt.sign({ channelId, type: "access" }, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
};

/**
 * Generates a refresh token (long-lived)
 * @param {string} channelId - Channel ID to encode in token
 * @returns {string} - JWT refresh token
 */
export const generateRefreshToken = (channelId) => {
  return jwt.sign({ channelId, type: "refresh" }, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
};

/**
 * Verifies and extracts channel ID from a token
 * @param {string} token - JWT token to verify
 * @param {string} expectedType - Expected token type ('access' or 'refresh')
 * @returns {Object|null} - Decoded token data or null if invalid
 */
export const verifyToken = (token, expectedType = "access") => {
  try {
    const secret =
      expectedType === "access" ? ACCESS_TOKEN_SECRET : REFRESH_TOKEN_SECRET;
    const decoded = jwt.verify(token, secret);

    // Check if token type matches expected type
    if (decoded.type !== expectedType) {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
};

export const LogedInChannel = (token) => {
  try {
    const decodedData = verifyToken(token, "access");
    if (!decodedData) return null;

    const channelIdVisiting = decodedData.channelId;
    return channelIdVisiting;
  } catch (error) {
    console.log("User not logged in");
    return null;
  }
};
