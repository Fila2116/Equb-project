import express from "express";
import { check, body } from "express-validator";
import userAuthController from "../../../controllers/user/auth/user-auth.controller";
import { validate } from "../../../middlewares/validate.middleware";
import * as UserAuthMiddleware from "../../../middlewares/user-auth.middleware";
import { log } from "console";

const router = express.Router();

//Send otp
router.post(
  "/otp",
  [check("to").not().isEmpty().withMessage("Phone number and email required")],
  validate,
  userAuthController.sendOtp
);

// Sign up customer/user
router.post(
  "/signup",
  userAuthController.uploadImage.pre,
  [
    body("firstName").not().isEmpty().withMessage("First name is required."),
    body("lastName").not().isEmpty().withMessage("Last name is required."),
    body("phoneNumber")
      .isLength({ min: 13, max: 13 })
      .withMessage("Phone number is required. (13 digits)"),
    body("password")
      .isLength({ min: 4 })
      .withMessage("Pin must be at least 4 characters long"),
    validate,
  ],
  validate,
  userAuthController.signupUser
);

// Log in user
router.post(
  "/login",
  [
    check("phoneNumber")
    .custom((value) => {
      const isEmail = /^[^\s@]+@(gmail\.com|companyname\.com)$/.test(value);
      const isPhone = /^\+251\d{9}$/.test(value); // Adjust length as per your requirements
  console.log("isEmail", isEmail);
  console.log("isPhone", isPhone);
      if (!isEmail && !isPhone) {
        throw new Error("Must be a valid email or phone number");
      }
      return true;
    }),
    check("password")
      .isLength({ min: 4 })
      .withMessage("Pin must be 4 characters long"),
  ],
  validate,
  userAuthController.loginUser
);

router.get("/", UserAuthMiddleware.verifyUser, userAuthController.getUser);

//Signup user Google Auth
router.post("/refresh-token", userAuthController.refreshToken);

router.post(
  "/forgot-password",
  [
    check("phoneNumber")
      .not()
      .isEmpty()
      .withMessage("Please insert your PhoneNumber or email ."),
  ],
  validate,
  userAuthController.forgotPassword
);
//Signup user Google Auth
router.post(
  "/reset-password",
  [
    check("otp").not().isEmpty().withMessage("Please insert otp code."),
    check("password")
      .isLength({ min: 4 })
      .withMessage("Pin must be 4 characters long"),
  ],
  validate,
  userAuthController.resetPassword
);

export default router;
