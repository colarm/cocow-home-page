import { Router } from "express";
import { ssoRedirect, ssoCallbackPost } from "./login.controller.js";

const router = Router();

// Returns { url } — frontend redirects browser to SSO consent page
router.get("/sso", ssoRedirect);

// Accepts { code } from frontend, exchanges with sso-server, returns { user, accessToken }
router.post("/callback", ssoCallbackPost);

export default router;
