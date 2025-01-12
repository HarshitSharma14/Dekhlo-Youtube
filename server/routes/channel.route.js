import { Router } from "express";
const app = Router();

app.post("/update-profile", (req, res) => {
  console.log(req.body);
  res.json({ message: "update-profile working fine" });
});

export default app;
