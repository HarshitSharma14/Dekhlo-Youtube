import { Router } from "express";
import { signup } from "../controllers/auth.controller.js";
import passport from "passport";
import GoogleStrategy from "passport-google-oidc";


const app = Router();

app.get("/login", login);



export default app;
