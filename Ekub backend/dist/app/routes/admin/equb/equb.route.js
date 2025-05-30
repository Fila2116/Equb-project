"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Equb = __importStar(require("../../../controllers/admin/equb/equb.controller"));
const EqubFilter = __importStar(require("../../../controllers/admin/equb//filters/equb.filter"));
const StaffAuthMiddleware = __importStar(require("../../../middlewares/staff-auth.middleware"));
const client_1 = require("@prisma/client");
const express_validator_1 = require("express-validator");
const validate_middleware_1 = require("../../../middlewares/validate.middleware");
const router = express_1.default.Router();
exports.default = router;
router.route("/getNotifications").get(Equb.getNotifications);
router.route("/financeAndOther").get(Equb.getFinanceAndOther);
router
    .route("/getEqubClaimer")
    .get(StaffAuthMiddleware.verifyStaff, StaffAuthMiddleware.restrictStaff(client_1.Permissions.equb), Equb.getEqubClaimer);
router
    .route("/getPaymentHistory")
    .get(StaffAuthMiddleware.verifyStaff, StaffAuthMiddleware.restrictStaff(client_1.Permissions.equb), Equb.getPaymentHistory);
router
    .route("/")
    .get(StaffAuthMiddleware.verifyStaff, StaffAuthMiddleware.restrictStaff(client_1.Permissions.equb), EqubFilter.getAllEqubs, Equb.getAllEqubs)
    .post(StaffAuthMiddleware.verifyStaff, StaffAuthMiddleware.restrictStaff(client_1.Permissions.equb), [
    (0, express_validator_1.check)("name").not().isEmpty().withMessage("name is required."),
    (0, express_validator_1.check)("startDate").not().isEmpty().withMessage("Start Date is required."),
    (0, express_validator_1.check)("equbTypeId").isUUID().withMessage("Equb type is not selected."),
    (0, express_validator_1.check)("branchId").optional().isUUID().withMessage("Branch not selected"),
    (0, express_validator_1.check)("equbCategoryId")
        .isUUID()
        .withMessage("Equb category is not selected."),
    (0, express_validator_1.check)("numberOfEqubers")
        .isNumeric()
        .withMessage("Number of Equbers is required in number."),
    (0, express_validator_1.check)("equbAmount")
        .isNumeric()
        .withMessage("Equb amount is required in number."),
    (0, express_validator_1.check)("groupLimit")
        .isNumeric()
        .withMessage("groupLimit is required in number."),
    (0, express_validator_1.check)("serviceCharge")
        .isNumeric()
        .withMessage("serviceCharge is required in number."),
    validate_middleware_1.validate,
], Equb.createEqub);
router
    .route("/getAllEqub")
    .get(StaffAuthMiddleware.verifyStaff, StaffAuthMiddleware.restrictStaff(client_1.Permissions.equb), Equb.getEqubs);
router
    .route("/stats")
    .get(StaffAuthMiddleware.verifyStaff, StaffAuthMiddleware.restrictStaff(client_1.Permissions.equb), Equb.getEqubStats);
router
    .route("/userPayment/:id")
    .get(StaffAuthMiddleware.verifyStaff, StaffAuthMiddleware.restrictStaff(client_1.Permissions.equb), Equb.userPayment);
router
    .route("/running")
    .get(StaffAuthMiddleware.verifyStaff, StaffAuthMiddleware.restrictStaff(client_1.Permissions.equb), Equb.getRunningEqubs);
router
    .route("/registering")
    .get(StaffAuthMiddleware.verifyStaff, StaffAuthMiddleware.restrictStaff(client_1.Permissions.equb), Equb.getRegisteringEqubs);
router
    .route("/closed")
    .get(StaffAuthMiddleware.verifyStaff, StaffAuthMiddleware.restrictStaff(client_1.Permissions.equb), Equb.getClosedEqubs);
router
    .route("/winner/:id")
    .get(StaffAuthMiddleware.verifyStaff, StaffAuthMiddleware.restrictStaff(client_1.Permissions.equb), Equb.getEqubWinners);
router
    .route("/:id")
    .get(StaffAuthMiddleware.verifyStaff, StaffAuthMiddleware.restrictStaff(client_1.Permissions.equb), Equb.getEqub)
    .patch(StaffAuthMiddleware.verifyStaff, StaffAuthMiddleware.restrictStaff(client_1.Permissions.equb), [
    (0, express_validator_1.check)("name").not().isEmpty().withMessage("name is required."),
    (0, express_validator_1.check)("numberOfEqubers")
        .optional()
        .isNumeric()
        .withMessage("Number of Equbers is required in number."),
    validate_middleware_1.validate,
], Equb.updateEqub);
router
    .route("/stat/:id")
    .get(StaffAuthMiddleware.verifyStaff, StaffAuthMiddleware.restrictStaff(client_1.Permissions.equb), Equb.getEqubStat);
router
    .route("/members/:id")
    .get(StaffAuthMiddleware.verifyStaff, StaffAuthMiddleware.restrictStaff(client_1.Permissions.equber), Equb.getEqubMembers);
router
    .route("/exportMembers/:id")
    .get(StaffAuthMiddleware.verifyStaff, StaffAuthMiddleware.restrictStaff(client_1.Permissions.equber), Equb.getExportEqubMembers);
router.route("/requests/:id").get(
// StaffAuthMiddleware.verifyStaff,
// StaffAuthMiddleware.restrictStaff(Permissions.equber),
Equb.getLotteryRequests);
router
    .route("/member/:id")
    .get(StaffAuthMiddleware.verifyStaff, StaffAuthMiddleware.restrictStaff(client_1.Permissions.equber), Equb.getEqubMember)
    .patch(StaffAuthMiddleware.verifyStaff, StaffAuthMiddleware.restrictStaff(client_1.Permissions.equber), [
    (0, express_validator_1.check)("adminPoint")
        .isNumeric()
        .withMessage("adminPoint is required in number."),
    (0, express_validator_1.check)("kycPoint")
        .isNumeric()
        .withMessage("kycPoint is required in number."),
    (0, express_validator_1.check)("financePoint")
        .isNumeric()
        .withMessage("financePoint is required in number."),
    (0, express_validator_1.check)("excluded")
        .isBoolean()
        .withMessage("excluded is required in boolean."),
    (0, express_validator_1.check)("included")
        .isBoolean()
        .withMessage("included is required in boolean."),
    (0, express_validator_1.check)("show").isBoolean().withMessage("show is required in boolean."),
    validate_middleware_1.validate,
], Equb.updateEqubMemberEligibility);
router
    .route("/getFinanceAndOtherMobile/:id")
    .get(Equb.getFinanceAndOtherMobile);
router
    .route("/lottery/:id")
    .get(StaffAuthMiddleware.verifyStaff, StaffAuthMiddleware.restrictStaff(client_1.Permissions.equb), Equb.getLottery)
    .patch(StaffAuthMiddleware.verifyStaff, StaffAuthMiddleware.restrictStaff(client_1.Permissions.equb), [
    (0, express_validator_1.check)("nextRoundDate")
        .isISO8601()
        .withMessage("Invalid date format. Please use YYYY-MM-DD format."),
    (0, express_validator_1.check)("nextRoundTime")
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .withMessage("Invalid time format. Please use HH:mm format."),
    (0, express_validator_1.check)("currentRoundWinners")
        .isNumeric()
        .withMessage("Number of winners is required in number."),
    (0, express_validator_1.check)("nextRoundLotteryType")
        .isIn([client_1.LotteryType.finance, client_1.LotteryType.request])
        .withMessage(`Valid lottery types are ${client_1.LotteryType.finance} and ${client_1.LotteryType.request}`),
    validate_middleware_1.validate,
], Equb.setLottery);
router
    .route("/mark-paid/:id")
    .post(StaffAuthMiddleware.verifyStaff, StaffAuthMiddleware.restrictStaff(client_1.Permissions.equber), Equb.markEqubberAsPaid);
router.route("/delete-notifications/:id").delete(Equb.deleteNotifications);
router.route("/closeEqub/:id").patch(Equb.closeEqub);
router
    .route("/deleteEqub/:id")
    .delete(StaffAuthMiddleware.verifyStaff, StaffAuthMiddleware.restrictStaff(client_1.Permissions.equb), Equb.deleteEqub);
router.route("/charts/:id").get(Equb.ChartData);
