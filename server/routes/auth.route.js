import { Router } from "express";
import { signup } from "../controllers/auth.controller.js";

const app = Router();

app.get("/login", login);

export default app;
