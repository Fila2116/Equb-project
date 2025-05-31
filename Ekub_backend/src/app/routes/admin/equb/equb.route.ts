import express from "express";

import * as Equb from "../../../controllers/admin/equb/equb.controller";
import * as EqubFilter from "../../../controllers/admin/equb//filters/equb.filter";
import * as StaffAuthMiddleware from "../../../middlewares/staff-auth.middleware";
import { LotteryType, Permissions } from "@prisma/client";
import { check } from "express-validator";
import { validate } from "../../../middlewares/validate.middleware";
import staffAuthController from "../../../controllers/admin/auth/staff-auth.controller";

const router = express.Router();

export default router;
router.route("/getNotifications").get(Equb.getNotifications);
router.route("/financeAndOther").get(Equb.getFinanceAndOther);

router
  .route("/getEqubClaimer")
  .get(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.equb),
    Equb.getEqubClaimer
  );
router
  .route("/getPaymentHistory")
  .get(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.equb),
    Equb.getPaymentHistory
  );

router
  .route("/")
  .get(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.equb),
    EqubFilter.getAllEqubs,
    Equb.getAllEqubs
  )
  
  .post(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.equb),
    [
      check("name").not().isEmpty().withMessage("name is required."),
      check("startDate").not().isEmpty().withMessage("Start Date is required."),
      check("equbTypeId").isUUID().withMessage("Equb type is not selected."),
      check("branchId").optional().isUUID().withMessage("Branch not selected"),
      check("equbCategoryId")
        .isUUID()
        .withMessage("Equb category is not selected."),
      check("numberOfEqubers")
        .isNumeric()
        .withMessage("Number of Equbers is required in number."),
      check("equbAmount")
        .isNumeric()
        .withMessage("Equb amount is required in number."),
      check("groupLimit")
        .isNumeric()
        .withMessage("groupLimit is required in number."),
      check("serviceCharge")
        .isNumeric()
        .withMessage("serviceCharge is required in number."),
      validate,
    ],
    Equb.createEqub
  );
router
  .route("/getAllEqub")
  .get(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.equb),
    Equb.getEqubs
  )


router
  .route("/stats")
  .get(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.equb),
    Equb.getEqubStats
  );
router
  .route("/userPayment/:id")
  .get(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.equb),
    Equb.userPayment
  );

router
  .route("/running")
  .get(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.equb),
    Equb.getRunningEqubs
  );
router
  .route("/registering")
  .get(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.equb),
    Equb.getRegisteringEqubs
  );
router
  .route("/closed")
  .get(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.equb),
    Equb.getClosedEqubs
  );
router
  .route("/winner/:id")
  .get(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.equb),
    Equb.getEqubWinners
  );

router
  .route("/:id")
  .get(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.equb),
    Equb.getEqub
  )
  .patch(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.equb),
    [
      check("name").not().isEmpty().withMessage("name is required."),
      check("numberOfEqubers")
        .optional()
        .isNumeric()
        .withMessage("Number of Equbers is required in number."),
      validate,
    ],
    Equb.updateEqub
  );
router
  .route("/stat/:id")
  .get(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.equb),
    Equb.getEqubStat
  );

router
  .route("/members/:id")
  .get(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.equber),
    Equb.getEqubMembers
  );
  router
  .route("/exportMembers/:id")
  .get(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.equber),
    Equb.getExportEqubMembers
  );


router.route("/requests/:id").get(
  // StaffAuthMiddleware.verifyStaff,
  // StaffAuthMiddleware.restrictStaff(Permissions.equber),
  Equb.getLotteryRequests
);

router
  .route("/member/:id")
  .get(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.equber),
    Equb.getEqubMember
  )
  .patch(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.equber),
    [
      check("adminPoint")
        .isNumeric()
        .withMessage("adminPoint is required in number."),
      check("kycPoint")
        .isNumeric()
        .withMessage("kycPoint is required in number."),
      check("financePoint")
        .isNumeric()
        .withMessage("financePoint is required in number."),
      check("excluded")
        .isBoolean()
        .withMessage("excluded is required in boolean."),
      check("included")
        .isBoolean()
        .withMessage("included is required in boolean."),
      check("show").isBoolean().withMessage("show is required in boolean."),
      validate,
    ],
    Equb.updateEqubMemberEligibility
  );
router
  .route("/getFinanceAndOtherMobile/:id")
  .get(Equb.getFinanceAndOtherMobile);
router
  .route("/lottery/:id")
  .get(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.equb),
    Equb.getLottery
  )
  .patch(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.equb),
    [
      check("nextRoundDate")
        .isISO8601()
        .withMessage("Invalid date format. Please use YYYY-MM-DD format."),
      check("nextRoundTime")
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .withMessage("Invalid time format. Please use HH:mm format."),
      check("currentRoundWinners")
        .isNumeric()
        .withMessage("Number of winners is required in number."),
      check("nextRoundLotteryType")
        .isIn([LotteryType.finance, LotteryType.request])
        .withMessage(
          `Valid lottery types are ${LotteryType.finance} and ${LotteryType.request}`
        ),
      validate,
    ],
    Equb.setLottery
  );

router
  .route("/mark-paid/:id")
  .post(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.equber),
    Equb.markEqubberAsPaid
  );

router.route("/delete-notifications/:id").delete(Equb.deleteNotifications);
router.route("/closeEqub/:id").patch(Equb.closeEqub);
router
  .route("/deleteEqub/:id")
  .delete(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.equb),
    Equb.deleteEqub
  );

router.route("/charts/:id").get(Equb.ChartData);
