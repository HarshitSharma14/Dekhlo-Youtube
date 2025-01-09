import { Router } from "express";
import { signup } from "../controllers/auth.controller.js";

const app = Router();

app.post("/signup", signup);

// app.post("/login",login);
export default app;
