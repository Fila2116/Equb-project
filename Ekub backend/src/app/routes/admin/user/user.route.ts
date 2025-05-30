import express from "express";

import * as UserController from "../../../controllers/admin/user/user.controller";
import * as StaffAuthMiddleware from "../../../middlewares/staff-auth.middleware";
import { Permissions } from "@prisma/client";
import { check } from "express-validator";
import { validate } from "../../../middlewares/validate.middleware";
import staffAuthController from "../../../controllers/admin/auth/staff-auth.controller";

const router = express.Router();

router
  .route("/")
  .get(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.user),
    UserController.getUsers
  );

router
  .route("/:id")
  .get(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.user),
    UserController.getUser
  );
router
  .route("/approve/:id")
  .patch(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.user),
    [
      check("decision")
        .isIn(["yes", "no"])
        .withMessage('Decision must be either "yes" or "no"'),
      validate,
    ],
    UserController.approveUser
  );

router
  .route("/deleteUser/:id")
  .delete(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.user),
    UserController.deleteUser
  );

export default router;
