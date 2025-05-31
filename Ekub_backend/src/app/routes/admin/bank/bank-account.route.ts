import express from "express";

import * as CompanyBankAccountController from "../../../controllers/admin/bank/bank-account.controller";
import * as StaffAuthMiddleware from "../../../middlewares/staff-auth.middleware";
import { Permissions } from "@prisma/client";
import { check } from "express-validator";
import { validate } from "../../../middlewares/validate.middleware";

const router = express.Router();

router
  .route("/")
  .get(
    // StaffAuthMiddleware.verifyStaff,
    // StaffAuthMiddleware.restrictStaff(Permissions.company_bank),
    CompanyBankAccountController.getBankAccounts
  )
  .post(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.company_bank),
    [
        check('accountName').not().isEmpty().withMessage('accountName is required.'),
        check('accountNumber').not().isEmpty().withMessage('accountNumber is required.'),
        validate
      ],
    CompanyBankAccountController.createBankAccount
  );

  router
  .route("/")
  .get(
    // StaffAuthMiddleware.verifyStaff,
    // StaffAuthMiddleware.restrictStaff(Permissions.company_bank),
    CompanyBankAccountController.getBankAccounts
  )
  .post(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.company_bank),
    [
        check('accountName').not().isEmpty().withMessage('accountName is required.'),
        check('accountNumber').not().isEmpty().withMessage('accountNumber is required.'),
        validate
      ],
    CompanyBankAccountController.createBankAccount
  );
  router
  .route("/getAllCompanyBankAccounts")
  .get(
    // StaffAuthMiddleware.verifyStaff,
    // StaffAuthMiddleware.restrictStaff(Permissions.company_bank),
    CompanyBankAccountController.getAllBankAccounts
  )
  

router
  .route("/:id")
  .get(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.company_bank),
    CompanyBankAccountController.getBankAccount
  )
  .patch(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.company_bank),
    [
        check('accountName').not().isEmpty().withMessage('accountName is required.'),
        check('accountNumber').not().isEmpty().withMessage('accountNumber is required.'),
        validate
      ],
    CompanyBankAccountController.updateBankAccount
  );


export default router;
