# Utility Functions Documentation

## Overview

This document describes the utility functions available in the `server/utils/` directory and how to use them in your application.

## Token Management Functions

### `extractTokenFromRequest(req)`

Extracts JWT token from request Authorization header.

**Parameters:**

- `req` (Object): Express request object

**Returns:**

- `string|null`: JWT token or null if not found

**Usage:**

```javascript
import { extractTokenFromRequest } from "../utils/utility.js";

const token = extractTokenFromRequest(req);
if (token) {
  // Process token
}
```

### `generateAccessToken(channelId)`

Generates a short-lived access token (30 minutes).

**Parameters:**

- `channelId` (string): Channel ID to encode in token

**Returns:**

- `string`: JWT access token

**Usage:**

```javascript
import { generateAccessToken } from "../utils/utility.js";

const accessToken = generateAccessToken(channel._id);
```

### `generateRefreshToken(channelId)`

Generates a long-lived refresh token (7 days).

**Parameters:**

- `channelId` (string): Channel ID to encode in token

**Returns:**

- `string`: JWT refresh token

**Usage:**

```javascript
import { generateRefreshToken } from "../utils/utility.js";

const refreshToken = generateRefreshToken(channel._id);
```

### `verifyToken(token, expectedType)`

Verifies and extracts data from a JWT token.

**Parameters:**

- `token` (string): JWT token to verify
- `expectedType` (string, optional): Expected token type ('access' or 'refresh', default: 'access')

**Returns:**

- `Object|null`: Decoded token data or null if invalid

**Usage:**

```javascript
import { verifyToken } from "../utils/utility.js";

const decodedData = verifyToken(token, "access");
if (decodedData) {
  const { channelId } = decodedData;
}
```

## Authentication Middleware

### `isUserLoggedIn`

Strict authentication middleware that requires a valid access token.

**Behavior:**

- Extracts token from Authorization header
- Verifies token validity and expiration
- Sets `req.channelId` if valid
- Returns 401 for invalid/expired tokens

**Usage:**

```javascript
import { isUserLoggedIn } from "../middlewares/auth.middleware.js";

app.get("/protected-route", isUserLoggedIn, (req, res) => {
  // req.channelId is guaranteed to exist
});
```

### `optionalAuth`

Optional authentication middleware that doesn't require authentication.

**Behavior:**

- Extracts token from Authorization header if present
- Verifies token validity without throwing errors
- Sets `req.channelId` if valid token exists
- Continues as anonymous user if no/invalid token
- **Returns 498 status for expired tokens** to allow frontend refresh handling
- Never throws errors for missing tokens

**Usage:**

```javascript
import { optionalAuth } from "../middlewares/auth.middleware.js";

app.get("/public-route", optionalAuth, (req, res) => {
  // req.channelId may or may not exist
  if (req.channelId) {
    // User is authenticated
  } else {
    // User is anonymous
  }
});
```

**Response Codes:**

- **200**: Valid token, `req.channelId` set
- **498**: Expired/invalid token (frontend should attempt refresh)
- **Anonymous**: No token provided, continues without authentication

## Token System Architecture

### Access Tokens

- **Lifetime**: 30 minutes
- **Purpose**: Authorization for API requests
- **Storage**: Frontend localStorage
- **Security**: Short-lived to minimize exposure

### Refresh Tokens

- **Lifetime**: 7 days
- **Purpose**: Obtaining new access tokens
- **Storage**: Frontend localStorage + Backend database (`Channel.refreshToken`)
- **Security**: Long-lived but revocable per-device by clearing the DB copy on logout, and rotated automatically when close to expiry

## Frontend Integration

### API Client Setup

```javascript
import api from "./utils/api.js";

// Automatic token handling
const response = await api.get("/api/endpoint");
```

### Token Storage

```javascript
// Store both tokens on login
localStorage.setItem("accessToken", accessToken);
localStorage.setItem("refreshToken", refreshToken);

// Clear on logout
localStorage.removeItem("accessToken");
localStorage.removeItem("refreshToken");
```

### Automatic Refresh

The API client automatically:

1. Detects 401/498 responses (expired access token)
2. Uses refresh token to get new access token
3. Retries original request
4. Handles refresh token expiration

## Security Notes

### Per-Device Revocation

- `logout` clears the user's `refreshToken` field, blocking any future `/auth/refresh` calls from that token.
- Already-issued access tokens remain valid until they naturally expire (≤ 30 minutes).

### Automatic Cleanup

- Expired tokens are automatically rejected by `verifyToken`.
- Refresh tokens close to expiration (< 1 day) are rotated automatically on `/auth/refresh`.

## Best Practices

### Token Security

- Never store tokens in plain text on the server
- Use HTTPS for all token transmission
- Implement proper logout procedures

### Error Handling

- Gracefully handle token expiration
- Provide clear feedback for authentication failures
- Implement proper fallback for anonymous users

### Performance

- Minimize database queries in token verification
- Use efficient token validation algorithms
