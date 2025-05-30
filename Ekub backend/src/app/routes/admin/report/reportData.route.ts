import express from "express";
import * as UserAuthMiddleware from "../../../middlewares/user-auth.middleware";
import { getReport } from "../../../controllers/user/report/reportData.controller";
import {
  generalReport,
  SpecificReport,
} from "../../../controllers/admin/report/reportData.controller";

const router = express.Router();

router.route("/generalReport").get(generalReport);
// Detailed report for a specific Equb
router.route("/:id").get(getReport);

// General report

// User-specific report
router.route("/userReport/:userId").get(SpecificReport);

export default router;
