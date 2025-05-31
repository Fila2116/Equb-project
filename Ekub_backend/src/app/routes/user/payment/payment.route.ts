import express from "express";

import * as PaymentController from "../../../controllers/user/payment/payment.controller";
import * as UserAuthMiddleware from "../../../middlewares/user-auth.middleware";
import { body } from "express-validator";
import { validate } from "../../../middlewares/validate.middleware";

const router = express.Router();

router.route("/confirm/:id").patch(
  UserAuthMiddleware.verifyUser,
  PaymentController.uploadImage.pre,
  [
  //  body('picture').not().isEmpty().withMessage('Payment photo is required.'),
   body("companyBankAccountId")
  .not()
  .isEmpty()
  .withMessage("Payment Bank is required."),
  validate
  ],
  
  
  PaymentController.confirmPayment
);

router
  .route("/transaction")
  .get(UserAuthMiddleware.verifyUser, PaymentController.getTransactionHistory);

router.post("/notify", PaymentController.paymentWebhook);

export default router;
