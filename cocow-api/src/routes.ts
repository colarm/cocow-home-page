import { Router } from "express";
import homeRouter from "./home/home.routes.js";
import loginRouter from "./login/login.routes.js";

const router = Router();

// Mount home routes
router.use("/home", homeRouter);

// Mount login / SSO routes
router.use("/login", loginRouter);

// Mock search endpoint — returns empty results until real engine is implemented
router.get("/search", (_req, res) => {
  res.json({ results: [] });
});

export default router;
