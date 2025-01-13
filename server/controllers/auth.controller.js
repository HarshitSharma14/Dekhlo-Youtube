import { compare } from "bcrypt";
import Channel from "../models/channel.model.js";
import jwt from "jsonwebtoken";
// import dotenv from "dotenv";
// dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "default-secret";
console.log(JWT_SECRET);
const maxAge = 24 * 60 * 60 * 1000;


export const loginSignup = async (accessToken, refreshToken, profile, cb) => {
  try {
    const email = profile.emails[0]?.value; // Extract email from Google profile

    if (!email) {
      return cb(null, false, {
        message: "Google account does not have an email.",
      });
    }
    let profileAlreadyExist = true;
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
      profileAlreadyExist = false;
    }

    // Generate JWT for the channel
    const token = jwt.sign(
      { userId: channel._id },
      JWT_SECRET,
      { expiresIn: maxAge } // Token expires in 1 hour
    );
    // console.log(token);
    return cb(null, { token, profileAlreadyExist });
  } catch (err) {
    return cb(err);
  }
};

export const oauth2_redirect = (req, res) => {
  if (!req.user || !req.user.token) {
    return res.redirect("http://localhost:5173");
  }
  const token = req.user.token;
  const profileAlreadyExist = req.user.profileAlreadyExist;

  // Set the token as an HTTP-only cookie
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: false, // Use true in production with HTTPS
    maxAge, // 1 day
  });
  if (!profileAlreadyExist) res.redirect("http://localhost:5173/profile-setup");
  else res.redirect("http://localhost:5173/");
};

export const logout = (req, res) => {
  res.clearCookie("jwt");
  res.json({ message: "Logged out successfully." });
};

export const getChannelInfo = async (req, res) => {
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
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    console.log(req.body)

    if (!email || !password) {
      return res.status(400).send("Please enter both email and password");
    }

    const user = await Channel.findOne({ email })

    console.log(user)

    if (!user) {
      return res.status(404).send("User with the given email not found.")
    }

    const auth = await compare(password, user.password)
    if (!auth) {
      return res.status(401).send("Password is incorrect.")
    }
    const userObj = user.toObject()

    delete userObj.password

    const token = jwt.sign(
      { userId: Channel._id },
      JWT_SECRET,
      { expiresIn: maxAge }
    );

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: false, // Use true in production with HTTPS
      maxAge, // 1 day
    });

    return res.status(200).send(userObj)

  }
  catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error")

  }
}
