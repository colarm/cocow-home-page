import { Router } from "express";
import { optionalAuth } from "../auth/auth.middleware.js";
import {
  getCategories,
  getWebsiteById,
  getWebsites,
  health,
  searchWebsites,
} from "./home.controller.js";

const router = Router();

router.get("/health", health);
router.get("/categories", getCategories);
router.get("/websites", optionalAuth, getWebsites);
router.get("/websites/:id", getWebsiteById);
router.get("/search", searchWebsites);

export default router;
