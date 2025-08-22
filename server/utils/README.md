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

### `generateAccessToken(channelId, tokenVersion)`

Generates a short-lived access token (15 minutes).

**Parameters:**

- `channelId` (string): Channel ID to encode in token
- `tokenVersion` (number, optional): Token version for revocation (default: 0)

**Returns:**

- `string`: JWT access token

**Usage:**

```javascript
import { generateAccessToken } from "../utils/utility.js";

const accessToken = generateAccessToken(channel._id, channel.tokenVersion);
```

### `generateRefreshToken(channelId, tokenVersion)`

Generates a long-lived refresh token (7 days).

**Parameters:**

- `channelId` (string): Channel ID to encode in token
- `tokenVersion` (number, optional): Token version for revocation (default: 0)

**Returns:**

- `string`: JWT refresh token

**Usage:**

```javascript
import { generateRefreshToken } from "../utils/utility.js";

const refreshToken = generateRefreshToken(channel._id, channel.tokenVersion);
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
  const { channelId, tokenVersion } = decodedData;
}
```

### `LogedInChannel(token)`

Legacy function for backward compatibility. Verifies access token and returns channel ID.

**Parameters:**

- `token` (string): JWT access token

**Returns:**

- `string|null`: Channel ID or null if invalid

**Usage:**

```javascript
import { LogedInChannel } from "../utils/utility.js";

const channelId = LogedInChannel(token);
```

## Authentication Middleware

### `isUserLoggedIn`

Strict authentication middleware that requires a valid access token.

**Behavior:**

- Extracts token from Authorization header
- Verifies token validity and expiration
- Checks token version for revocation
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

- **Lifetime**: 15 minutes
- **Purpose**: Authorization for API requests
- **Storage**: Frontend localStorage
- **Security**: Short-lived to minimize exposure

### Refresh Tokens

- **Lifetime**: 7 days
- **Purpose**: Obtaining new access tokens
- **Storage**: Frontend localStorage + Backend database
- **Security**: Long-lived but revocable

### Token Versioning

- **Purpose**: Token revocation across all devices
- **Implementation**: Incremented on logout/security events
- **Effect**: All existing tokens become invalid

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

1. Detects 401 responses (expired access token)
2. Uses refresh token to get new access token
3. Retries original request
4. Handles refresh token expiration

## Security Features

### Token Revocation

- Increment `tokenVersion` to invalidate all tokens
- Useful for logout from all devices
- Immediate effect across all sessions

### Automatic Cleanup

- Expired tokens are automatically rejected
- Invalid tokens return 401 without database queries
- Refresh tokens close to expiration are automatically renewed

### Rate Limiting

- Refresh endpoint should be rate-limited
- Failed refresh attempts trigger logout
- Queue system prevents multiple simultaneous refreshes

## Migration Guide

### From Single Token System

1. Update database schema to include refresh token fields
2. Replace `jwt` with `accessToken` in localStorage
3. Add refresh token storage and handling
4. Update API calls to use new token names
5. Test automatic refresh functionality

### Backward Compatibility

- `LogedInChannel` function still works
- Existing single-token endpoints continue to function
- Gradual migration to new system possible

## Best Practices

### Token Security

- Never store tokens in plain text
- Use HTTPS for all token transmission
- Implement proper logout procedures
- Monitor for suspicious token usage

### Error Handling

- Gracefully handle token expiration
- Provide clear feedback for authentication failures
- Implement proper fallback for anonymous users

### Performance

- Minimize database queries in token verification
- Use efficient token validation algorithms
- Implement proper caching strategies
