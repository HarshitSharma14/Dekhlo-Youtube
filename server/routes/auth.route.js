import { Router } from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import Channel from "../models/channel.model.js";
import mongoose from "mongoose";

const app = Router();

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/oauth2/redirect/google",
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        const email = profile.emails[0]?.value; // Extract email from Google profile

        if (!email) {
          return cb(null, false, {
            message: "Google account does not have an email.",
          });
        }

        // Check if a channel with this email already exists
        let channel = await Channel.findOne({ email });

        if (!channel) {
          // If no channel exists, create a new one
          channel = new Channel({
            channelName: profile.displayName || "Unnamed Channel",
            email: email,
            profilePhoto: profile.photos[0]?.value || "", // Google profile picture
          });

          await channel.save();
        }

        // Generate JWT for the channel
        const token = jwt.sign(
          { userId: channel._id },
          JWT_SECRET,
          { expiresIn: "1h" } // Token expires in 1 hour
        );

        return cb(null, { token });
      } catch (err) {
        return cb(err);
      }
    }
  )
);

// Middleware to protect routes using JWT
export const authenticateJWT = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token)
    return res
      .status(401)
      .json({ message: "Access denied, no token provided." });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err)
      return res.status(403).json({ message: "Invalid or expired token." });

    req.userId = decoded.userId;
    next();
  });
};

// Example usage of protected routes

// app.get("/protected", authenticateJWT, (req, res) => {
//   res.json({ message: "This is a protected route", userId: req.userId });
// });

// Example Google OAuth2 route
app.get(
  "/oauth2/redirect/google",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  (req, res) => {
    const token = req.user.token;
    res.redirect(`/welcome?token=${token}`);
  }
);

// app.get("/login", login);
// app.get('/login/federated/google', passport.authenticate('google'));

export default app;
