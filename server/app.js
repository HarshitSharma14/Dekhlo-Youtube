import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.route.js";

dotenv.config({ path: "./.env" });
const databaseURL = process.env.DATABASE_URL;
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173", // Frontend URL
    credentials: true,
  })
);
// App Routes ************************
app.use("/api/v1/auth", authRoutes);

app.get("/", (_, res) => {
  res.send("Home route working on the Youtube app");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);

  mongoose
    .connect(databaseURL)
    .then(() => console.log("DB Connection success"))
    .catch((e) => console.log(e.message));
});
