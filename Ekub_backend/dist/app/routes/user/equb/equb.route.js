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
const Equb = __importStar(require("../../../controllers/user/equb/equb.controller"));
const EqubFilter = __importStar(require("../../../controllers/user/equb/filters/equb.filter"));
const express_validator_1 = require("express-validator");
const validate_middleware_1 = require("../../../middlewares/validate.middleware");
const UserAuthMiddleware = __importStar(require("../../../middlewares/user-auth.middleware"));
const router = express_1.default.Router();
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
    .get(UserAuthMiddleware.verifyUser, Equb.getEqubPayments);
router.route("/lotteries/:id").get(Equb.getEqubLotteries);
router
    .route("/userEqub/:equbId/:userId")
    .get(UserAuthMiddleware.verifyUser, Equb.GetEquberUser);
router.route("/lottery/:id").get(Equb.getEqubLottery);
router.route("/join/:id").post(UserAuthMiddleware.verifyUser, 
// Equb.uploadImage.pre,
[
    (0, express_validator_1.body)("paidAmount")
        .isNumeric()
        .not()
        .isEmpty()
        .withMessage("amount is required in number."),
    (0, express_validator_1.body)("paymentMethod")
        .not()
        .isEmpty()
        .withMessage("Payment method is required."),
    (0, express_validator_1.body)("equbers")
        .isArray({ min: 1 })
        .withMessage("equbers must be an array with at least one item"),
    (0, express_validator_1.body)("equbers.*.stake").isNumeric().withMessage("stake must be a number"),
    (0, express_validator_1.body)("equbers.*.paidAmount")
        .isNumeric()
        .withMessage("paidAmount must be a number"),
    validate_middleware_1.validate,
], Equb.joinEqub);
router
    .route("/payment/:id")
    .get(UserAuthMiddleware.verifyUser, Equb.getMyEqubPayment)
    .post(UserAuthMiddleware.verifyUser, 
// Equb.uploadImage.pre,
[
    (0, express_validator_1.body)("paidAmount")
        .isNumeric()
        .not()
        .isEmpty()
        .withMessage("amount is required in number."),
    (0, express_validator_1.body)("paymentMethod")
        .not()
        .isEmpty()
        .withMessage("Payment method is required."),
    (0, express_validator_1.body)("lottery")
        .isArray({ min: 1 })
        .withMessage("lottery must be an array with at least one item"),
    (0, express_validator_1.body)("lottery.*.id").isUUID().withMessage("id must be UUID"),
    (0, express_validator_1.body)("lottery.*.paidAmount")
        .isNumeric()
        .withMessage("paidAmount must be a number"),
    validate_middleware_1.validate,
], Equb.makeEqubPayment);
router
    .route("/request/:id")
    .get(UserAuthMiddleware.verifyUser, Equb.getMyLotteryRequest)
    .post(UserAuthMiddleware.verifyUser, 
// Equb.uploadImage.pre,
[
    (0, express_validator_1.body)("itemName")
        .not()
        .isEmpty()
        .withMessage("itemName is required in number."),
    (0, express_validator_1.body)("description")
        .not()
        .isEmpty()
        .withMessage("description is required."),
    (0, express_validator_1.body)("amount").isNumeric().withMessage("amount must be a number"),
    validate_middleware_1.validate,
], Equb.makeLotteryRequest)
    .patch(UserAuthMiddleware.verifyUser, 
// Equb.uploadImage.pre,
[
    (0, express_validator_1.body)("itemName")
        .optional()
        .not()
        .isEmpty()
        .withMessage("itemName is required in number."),
    (0, express_validator_1.body)("description")
        .optional()
        .not()
        .isEmpty()
        .withMessage("description is required."),
    (0, express_validator_1.body)("amount")
        .optional()
        .isNumeric()
        .withMessage("amount must be a number"),
    validate_middleware_1.validate,
], Equb.updateLotteryRequest);
router
    .route("/guarantee/:id")
    .post(UserAuthMiddleware.verifyUser, Equb.uploadGuaranteeImage.pre, [
    (0, express_validator_1.body)("firstName").not().isEmpty().withMessage("First name is required."),
    (0, express_validator_1.body)("lastName")
        .not()
        .isEmpty()
        .withMessage("Last name is required in number."),
    (0, express_validator_1.body)("phoneNumber")
        .not()
        .isEmpty()
        .withMessage("Phone number method is required."),
    validate_middleware_1.validate,
], Equb.setGuarantee);
router.route("/claim/:id").post(UserAuthMiddleware.verifyUser, Equb.claimEqub);
router
    .route("/savingMember/:id")
    .get(UserAuthMiddleware.verifyUser, Equb.savingMember);
exports.default = router;
