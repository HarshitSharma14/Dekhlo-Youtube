import { Router } from "express";
import {
  login,
  logout,
  googleLogin,
  refreshToken,
} from "../controllers/auth.controller.js";
import { isUserLoggedIn } from "../middlewares/auth.middleware.js";

const app = Router();

// Routes ***********************************
app.post("/login", login);
app.post("/google-login", googleLogin);
app.post("/refresh", refreshToken);
app.get("/logout", isUserLoggedIn, logout);

export default app;
