import express from "express";

import * as PaymentController from "../../../controllers/admin/payment/payment.controller";
import * as PaymentFilter from "../../../controllers/admin/payment/filter/payment.filter";
import * as StaffAuthMiddleware from "../../../middlewares/staff-auth.middleware";
import { Permissions } from "@prisma/client";
import { check } from "express-validator";
import { validate } from "../../../middlewares/validate.middleware";

const router = express.Router();

router
  .route("/")
  .get(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.payment),
    PaymentFilter.getPayments,
    PaymentController.getPayments
  );

router
  .route("/paymentExport")
  .get(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.payment),
    PaymentFilter.getPayments,
    PaymentController.getExportPayments
  );

  router
  .route("/getPendingPayments")
  .get(
    PaymentController.getExportPayments
  );


router
  .route("/:id")
  .get(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.payment),
    PaymentController.getPayment
  )
  .patch(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.payment),
    [
      check("approved")
        .isIn(["yes", "no"])
        .withMessage('approved must be either "yes" or "no"'),
      validate,
    ],
    PaymentController.approvePayment
  );

export default router;
