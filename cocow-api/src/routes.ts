import { Router } from "express";
import homeRouter from "./home/home.routes.js";
import loginRouter from "./login/login.routes.js";
import userWebsitesRouter from "./userWebsites/userWebsites.routes.js";
import localUsersRouter from "./localUser/localUser.routes.js";

const router = Router();

// Mount home routes
router.use("/home", homeRouter);

// Mount login / SSO routes
router.use("/login", loginRouter);

// Mount user website list routes (requires auth)
router.use("/user-websites", userWebsitesRouter);

// Local user management (role administration, ADMIN only)
router.use("/local-users", localUsersRouter);

// Mock search endpoint — returns empty results until real engine is implemented
router.get("/search", (_req, res) => {
  res.json({ results: [] });
});

export default router;
