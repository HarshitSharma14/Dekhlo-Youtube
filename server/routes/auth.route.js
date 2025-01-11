import { Router } from "express";
import jwt from "jsonwebtoken";
import passport from "passport";
import dotenv from "dotenv";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import Channel from "../models/channel.model.js";

dotenv.config({ path: "../.env" });
const app = Router();
const id = process.env.GOOGLE_CLIENT_ID;
console.log(id);
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
// Passport Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID:
        "772059276751-254jqfgqkndq0d1aa20uv34j2pcipbos.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: "http://localhost:3000/api/v1/auth/oauth2/redirect/google",
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
        // console.log(token);
        return cb(null, { token });
      } catch (err) {
        return cb(err);
      }
    }
  )
);

app.use(passport.initialize());

// Routes
app.get(
  "/login/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

app.get(
  "/oauth2/redirect/google",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:5173",
    session: false,
  }),
  (req, res) => {
    if (!req.user || !req.user.token) {
      return res.redirect("http://localhost:5173");
    }
    const token = req.user.token;

    // Set the token as an HTTP-only cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: false, // Use true in production with HTTPS
      maxAge: 3600000, // 1 hour
    });
    res.redirect("http://localhost:5173/dashboard");
  }
);
app.get("/logout", (req, res) => {
  res.clearCookie("jwt");
  res.json({ message: "Logged out successfully." });
});

// Protected Route
app.get("/user", async (req, res) => {
  const token = req.cookies.jwt;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await Channel.findById(decoded.userId);
    res.json(user);
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
});

export default app;
