import express from "express";

import * as Dashboard from "../../../controllers/admin/dashboard/dashboard.controller";
import * as StaffAuthMiddleware from "../../../middlewares/staff-auth.middleware";
import { Permissions } from "@prisma/client";

const router = express.Router();

router
  .route("/stat")
  .get(
    StaffAuthMiddleware.verifyStaff,
    // StaffAuthMiddleware.restrictStaff(Permissions.branch),
    Dashboard.getEqubStat
  )

export default router;
