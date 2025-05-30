import express from "express";

import * as BankController from "../../../controllers/admin/bank/bank.controller";
import * as StaffAuthMiddleware from "../../../middlewares/staff-auth.middleware";
import { Permissions } from "@prisma/client";
import { check } from "express-validator";
import { validate } from "../../../middlewares/validate.middleware";

const router = express.Router();

router
  .route("/")
  .get(BankController.getBanks)
  .post(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.role),
    [check("name").not().isEmpty().withMessage("name is required."), validate],
    BankController.createBank
  );

router
  .route("/:id")
  .get(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.role),
    BankController.getBank
  )
  .patch(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.role),
    [check("name").not().isEmpty().withMessage("name is required."), validate],
    BankController.updateBank
  );
router
  .route("/deleteBankList/:id")
  .delete(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.role),
    BankController.deleteBank
  );
router
  .route("/deleteCompanyBank/:id")
  .delete(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.role),
    BankController.deleteCompanyBank
  );

export default router;
