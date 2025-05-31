import express from "express";

import * as CompanyProfileController from "../../../controllers/admin/companyProfile/companyProfile.controller";
import * as StaffAuthMiddleware from "../../../middlewares/staff-auth.middleware";
import { Permissions } from "@prisma/client";
import { check } from "express-validator";
import { validate } from "../../../middlewares/validate.middleware";

const router = express.Router();

router
  .route("/")
  .get(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.all),
    CompanyProfileController.getCompanyProfile
  )
  .post(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.all),
    [
      check('country').not().isEmpty().withMessage('country is required.'),
      check('city').not().isEmpty().withMessage('city is required.'),
      check('address').not().isEmpty().withMessage('address is required.'),
      check('email').not().isEmpty().withMessage('email is required.'),
      check('tel').optional().isLength({ min: 10, max: 14 }).withMessage('Phone number must be at least 10 digits.'),

      validate
    ],
    CompanyProfileController.createCompanyProfile
  );

router
  .route("/getCompanyProfileforHeader")
  .get(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.all),
    CompanyProfileController.getCompanyProfileForHeader
  );

router
  .route("/:id")
  .patch(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.all),
    [
      check('country').not().isEmpty().withMessage('country is required.'),
      check('city').not().isEmpty().withMessage('city is required.'),
      check('address').not().isEmpty().withMessage('address is required.'),
      check('email').not().isEmpty().withMessage('email is required.'),
      check('tel').optional().isLength({ min: 10, max: 14 }).withMessage('Phone number must be at least 10 digits.'),
      
  validate
    ],
CompanyProfileController.updateCompanyProfile
  );
router
  .route("/deleteCompanyProfile/:id")
  .delete(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.role),
    CompanyProfileController.deleteCompanyProfile
  );

export default router;
