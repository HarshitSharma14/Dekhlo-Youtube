import { Router } from "express";
import passport from "passport";
import { logout, oauth2_redirect } from "../controllers/auth.controller.js";

import { login } from "../controllers/auth.controller.js";
import { isUserLoggedIn } from "../middlewares/auth.middleware.js";

const app = Router();

// login with Google Route *****************************************
app.get(
  "/login/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

// Google redirects here after authentication
app.get(
  "/oauth2/redirect/google",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:5173",
    session: false,
  }),
  oauth2_redirect
);

// Routes ***********************************
app.post("/login", login);
app.get("/logout", isUserLoggedIn, logout);

export default app;
