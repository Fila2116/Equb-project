import express from "express";
import { getReport } from "../../../controllers/user/report/reportData.controller";
import * as UserAuthMiddleware from "../../../middlewares/user-auth.middleware";

const router = express.Router();

// router.route("/:id").get(UserAuthMiddleware.verifyUser, getReport);
router.route("/:id").get(UserAuthMiddleware.verifyUser, getReport);
export default router;
