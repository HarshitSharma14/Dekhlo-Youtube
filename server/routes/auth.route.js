import { Router } from "express";
import passport from "passport";
import {
  getChannelInfo,
  logout,
  oauth2_redirect,
} from "../controllers/auth.controller.js";

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

// Normal Routes ****************************************************
app.get("/logout", logout);
app.get("/channel", getChannelInfo);

export default app;
