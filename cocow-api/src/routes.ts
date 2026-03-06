import { Router } from "express";
import homeRouter from "./home/home.routes.js";
import loginRouter from "./login/login.routes.js";

const router = Router();

// Mount home routes
router.use("/home", homeRouter);

// Mount login / SSO routes
router.use("/login", loginRouter);

export default router;
