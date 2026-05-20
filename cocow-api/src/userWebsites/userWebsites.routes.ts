import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import {
  addToUserWebsites,
  listUserWebsites,
  patchUserWebsite,
  reorderUserWebsites,
  removeFromUserWebsites,
} from "./userWebsites.controller.js";

const router = Router();

// All user-website routes require authentication
router.use(requireAuth);

router.get("/", listUserWebsites);
router.post("/", addToUserWebsites);
router.put("/reorder", reorderUserWebsites);
router.patch("/:websiteId", patchUserWebsite);
router.delete("/:websiteId", removeFromUserWebsites);

export default router;
