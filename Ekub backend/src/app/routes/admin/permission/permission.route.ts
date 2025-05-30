import express from "express";

import * as PermissionController from "../../../controllers/admin/permission/permission.controller";
import * as StaffAuthMiddleware from "../../../middlewares/staff-auth.middleware";
import { Permissions } from "@prisma/client";

const router = express.Router();

router
  .route("/")
  .get(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.permissions),
    PermissionController.getPermissions
  )
export default router;
