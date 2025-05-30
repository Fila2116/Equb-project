import express from "express";

import * as UserController from "../../../controllers/user/profile/user-profile.controller";
import * as BankController from "../../../controllers/admin/bank/bank.controller";
import * as UserAuthMiddleware from "../../../middlewares/user-auth.middleware";
import { Gender, Permissions } from "@prisma/client";
import { body, check } from "express-validator";
import { validate } from "../../../middlewares/validate.middleware";

const router = express.Router();

router
  .route("/me")
  .get(
    UserAuthMiddleware.verifyUser,
    UserController.getMyProfile
  );
  router
  .route("/banks")
  .get(
    UserAuthMiddleware.verifyUser,
    BankController.getBanks
  );

  router
  .route("/profile-pic/:id")
  .patch(
    UserAuthMiddleware.verifyUser,
    UserAuthMiddleware.restrictUser,
    
    UserController.updateProfilePic
  );

  router
  .route("/personal-info/:id")
  .patch(
    UserAuthMiddleware.verifyUser,
    UserAuthMiddleware.restrictUser,
    UserController.uploadImage.pre,
    [
        body('firstName').not().isEmpty().withMessage('firstName is required.'),
        body('lastName').not().isEmpty().withMessage('lastName is required.'),
        body('phoneNumber').not().isEmpty().withMessage('phoneNumber is required.'),
        body('gender').isIn(['male','female']).withMessage(`Valid gender values are ${Gender.female} and ${Gender.male}.`),
        validate
      ],
    UserController.updatePersonalInfo
  );
  
router.route('/financial-info').get(
  UserAuthMiddleware.verifyUser,
  UserController.getMyBankAccounts
);
  router
  .route("/financial-info/:id")
  .patch(
    UserAuthMiddleware.verifyUser,
    UserAuthMiddleware.restrictUser,
    [
        check('bankId').isUUID().withMessage('bankId is required.'),
        check('accountName').not().isEmpty().withMessage('Account name is required.'),
        check('accountNumber').isInt().withMessage('A valid account number is required.'),
        validate
      ],
    UserController.addBankAccount
  );

  router
  .route("/bank-account/:id")
  .patch(
    UserAuthMiddleware.verifyUser,
    // UserAuthMiddleware.restrictUser,
    [
        check('accountName').not().isEmpty().withMessage('Account name is required.'),
        check('accountNumber').isInt().withMessage('A valid account number is required.'),
        validate
      ],
    UserController.updateBankAccount
  );





export default router;
