import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.route.js";

dotenv.config({ path: "./.env" });
const databaseURL = process.env.DATABASE_URL;
const app = express();

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
