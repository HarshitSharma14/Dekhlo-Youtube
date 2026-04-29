export const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;
export const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET;

// JWT token expiration times
export const ACCESS_TOKEN_EXPIRY = "30m";
export const REFRESH_TOKEN_EXPIRY = "7d";

export const videoCategoryEnum = [
  "news",
  "sports",
  "education",
  "entertainment",
  "music",
  "technology",
  "gaming",
  "motivation",
  "art",
  "others",
];
