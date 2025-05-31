import express from "express";

import * as StaffController from "../../../controllers/admin/staff/staff.controller";
import * as StaffAuthMiddleware from "../../../middlewares/staff-auth.middleware";
import { Permissions } from "@prisma/client";
import { body, check } from "express-validator";
import { validate } from "../../../middlewares/validate.middleware";

const router = express.Router();

router
  .route("/")
  .get(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.staff),
    StaffController.getStaffs
  )

  .post(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.staff),
    StaffController.uploadImage.pre,
    // StaffController.uploadImage.post,
    [
      body("firstName", "firstName is required").not().isEmpty(),
      body("lastName", "lastName is required").not().isEmpty(),
      body("email", "Valid email is required")
        .isEmail()
        .trim()
        .escape()
        .normalizeEmail(),
      body("phoneNumber", "phoneNumber is required").not().isEmpty(),
      body("roleId", "roleId is Invalid UUID format").isUUID(),
      // body("branchId", "branch Id is Invalid UUID format").optional().isUUID(),
      validate,
    ],
    StaffController.createStaff
  );

router
  .route("/getStaffsWithOutPagination")
  .get(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.staff),
    StaffController.getExportStaffs
  )
router
  .route("/:id")
  .get(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.staff),
    StaffController.getStaff
  )
  .patch(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.staff),
    StaffController.uploadImage.pre,
    // StaffController.uploadImage.post,
    [
      body("firstName", "firstName is required").not().isEmpty(),
      body("lastName", "lastName is required").not().isEmpty(),
      body("email", "Valid email is required")
        .isEmail()
        .trim()
        .escape()
        .normalizeEmail(),
      body("phoneNumber", "phoneNumber is required").not().isEmpty(),
      body("roleId", "roleId is Invalid UUID format").isUUID(),
      validate,
    ],
    StaffController.updateStaff
  );

router
  .route("/deleteStaff/:id")
  .delete(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.staff),
    StaffController.deleteStaff
  );

export default router;
