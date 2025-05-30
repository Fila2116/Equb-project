import express from "express";
import { check } from "express-validator";
import staffAuthController from "../../../controllers/admin/auth/staff-auth.controller";
import { validate } from "../../../middlewares/validate.middleware";

import * as StaffAuthMiddleware from "../../../middlewares/staff-auth.middleware";

const router = express.Router();

// Log in staff
router.post(
  "/login",
  [
    check("email").isEmail().withMessage("Please include a valid email."),
    check("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  validate,
  staffAuthController.loginStaff
);
router.get("/", StaffAuthMiddleware.verifyStaff, staffAuthController.getStaff);
router.post(
  "/forgot-password",
  [
    check("emailOrPhoneNumber")
      .not()
      .isEmpty()
      .withMessage("Please insert your Phone Number or email ."),
  ],
  validate,
  staffAuthController.forgotPassword
);
//Signup user Google Auth
router.post(
  "/reset-password",
  [
    check("otp").not().isEmpty().withMessage("Please insert otp code.")
  ],
  validate,
  staffAuthController.resetPassword
);

// verify in staff
router.post(
  "/verify",
  StaffAuthMiddleware.verifyStaff,
  staffAuthController.verify
);
// SEND OTP TO ADMIN
router.post(
  "/sendOtpToAdmin",
  StaffAuthMiddleware.verifyStaff,
  validate,
  staffAuthController.sendOtpToAdmin
);


export default router;
