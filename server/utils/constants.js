export const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;
export const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET;

// JWT token expiration times
export const ACCESS_TOKEN_EXPIRY = "30m"; // Access token expires in 30 minutes

export const REFRESH_TOKEN_EXPIRY = "7d"; // Long-lived refresh token (7 days)
export const REFRESH_TOKEN_REFRESH_THRESHOLD = "1d"; // Refresh if less than 1 day left

// Legacy support (keeping for backward compatibility)
export const maxAge = ACCESS_TOKEN_EXPIRY;

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
