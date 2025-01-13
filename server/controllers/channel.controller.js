import Channel from "../models/channel.model.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../utils/constants.js";

// const JWT_SECRET = process.env.JWT_SECRET || "default-secret";
// console.log(JWT_SECRET);

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
