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
const PaymentController = __importStar(require("../../../controllers/user/payment/payment.controller"));
const UserAuthMiddleware = __importStar(require("../../../middlewares/user-auth.middleware"));
const express_validator_1 = require("express-validator");
const validate_middleware_1 = require("../../../middlewares/validate.middleware");
const router = express_1.default.Router();
router.route("/confirm/:id").patch(UserAuthMiddleware.verifyUser, PaymentController.uploadImage.pre, [
    //  body('picture').not().isEmpty().withMessage('Payment photo is required.'),
    (0, express_validator_1.body)("companyBankAccountId")
        .not()
        .isEmpty()
        .withMessage("Payment Bank is required."),
    validate_middleware_1.validate
], PaymentController.confirmPayment);
router
    .route("/transaction")
    .get(UserAuthMiddleware.verifyUser, PaymentController.getTransactionHistory);
router.post("/notify", PaymentController.paymentWebhook);
exports.default = router;
