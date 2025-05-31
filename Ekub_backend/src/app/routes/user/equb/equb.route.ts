import express from "express";

import * as Equb from "../../../controllers/user/equb/equb.controller";
import * as EqubFilter from "../../../controllers/user/equb/filters/equb.filter";
import { body, check } from "express-validator";
import { validate } from "../../../middlewares/validate.middleware";
import * as UserAuthMiddleware from "../../../middlewares/user-auth.middleware";

const router = express.Router();

router.route("/").get(EqubFilter.getEqubs, Equb.getEqubs);
router.route("/unwon-users").get(Equb.getUnwonUsers);
router.route("/save-guarantee/:id").post(Equb.saveGuarantee);
router.route("/get-guarantee/:id").get(Equb.getGuarantee);
router
  .route("/sendGuarantorNotificaton/:id")
  .post(Equb.sendGuarantorNotificaton);
router.route("/sendDeleteNotification/:id").post(Equb.sendDeleteNotification);
router
  .route("/pending")
  .get(UserAuthMiddleware.verifyUser, Equb.getMyPendingEqubs);

router.route("/:id").get(Equb.getEqub);
router.route("/userEqub/:userId").get(Equb.getUserEqub);
router
  .route("/payments/:id")
  .get(
    UserAuthMiddleware.verifyUser, 
    Equb.getEqubPayments);
router.route("/lotteries/:id").get(Equb.getEqubLotteries);
router
  .route("/userEqub/:equbId/:userId")
  .get(UserAuthMiddleware.verifyUser, Equb.GetEquberUser);

router.route("/lottery/:id").get(Equb.getEqubLottery);
router.route("/join/:id").post(
  UserAuthMiddleware.verifyUser,
  // Equb.uploadImage.pre,
  [
    body("paidAmount")
      .isNumeric()
      .not()
      .isEmpty()
      .withMessage("amount is required in number."),
    body("paymentMethod")
      .not()
      .isEmpty()
      .withMessage("Payment method is required."),
    body("equbers")
      .isArray({ min: 1 })
      .withMessage("equbers must be an array with at least one item"),
    body("equbers.*.stake").isNumeric().withMessage("stake must be a number"),
    body("equbers.*.paidAmount")
      .isNumeric()
      .withMessage("paidAmount must be a number"),
    validate,
  ],
  Equb.joinEqub
);

router
  .route("/payment/:id")
  .get(UserAuthMiddleware.verifyUser, Equb.getMyEqubPayment)
  .post(
    UserAuthMiddleware.verifyUser,
    // Equb.uploadImage.pre,
    [
      body("paidAmount")
        .isNumeric()
        .not()
        .isEmpty()
        .withMessage("amount is required in number."),
      body("paymentMethod")
        .not()
        .isEmpty()
        .withMessage("Payment method is required."),
      body("lottery")
        .isArray({ min: 1 })
        .withMessage("lottery must be an array with at least one item"),
      body("lottery.*.id").isUUID().withMessage("id must be UUID"),
      body("lottery.*.paidAmount")
        .isNumeric()
        .withMessage("paidAmount must be a number"),
      validate,
    ],
    Equb.makeEqubPayment
  );

router
  .route("/request/:id")
  .get(UserAuthMiddleware.verifyUser, Equb.getMyLotteryRequest)
  .post(
    UserAuthMiddleware.verifyUser,
    // Equb.uploadImage.pre,
    [
      body("itemName")
        .not()
        .isEmpty()
        .withMessage("itemName is required in number."),
      body("description")
        .not()
        .isEmpty()
        .withMessage("description is required."),
      body("amount").isNumeric().withMessage("amount must be a number"),
      validate,
    ],
    Equb.makeLotteryRequest
  )
  .patch(
    UserAuthMiddleware.verifyUser,
    // Equb.uploadImage.pre,
    [
      body("itemName")
        .optional()
        .not()
        .isEmpty()
        .withMessage("itemName is required in number."),
      body("description")
        .optional()
        .not()
        .isEmpty()
        .withMessage("description is required."),
      body("amount")
        .optional()
        .isNumeric()
        .withMessage("amount must be a number"),
      validate,
    ],
    Equb.updateLotteryRequest
  );

router
  .route("/guarantee/:id")
  .post(
    UserAuthMiddleware.verifyUser,
    Equb.uploadGuaranteeImage.pre,
    [
      body("firstName").not().isEmpty().withMessage("First name is required."),
      body("lastName")
        .not()
        .isEmpty()
        .withMessage("Last name is required in number."),
      body("phoneNumber")
        .not()
        .isEmpty()
        .withMessage("Phone number method is required."),
      validate,
    ],
    Equb.setGuarantee
  );

router.route("/claim/:id").post(UserAuthMiddleware.verifyUser, Equb.claimEqub);
router
  .route("/savingMember/:id")
  .get(UserAuthMiddleware.verifyUser, Equb.savingMember);

export default router;
