import { Router } from "express";
import { ssoRedirect, ssoCallbackPost, ssoLogout } from "./login.controller.js";

const router = Router();

// Returns { url } — frontend redirects browser to SSO consent page
router.get("/sso", ssoRedirect);

// Accepts { code } from frontend, exchanges with sso-server, sets HttpOnly cookie, returns { user }
router.post("/callback", ssoCallbackPost);

// Clears the auth_token HttpOnly cookie
router.post("/logout", ssoLogout);

export default router;
