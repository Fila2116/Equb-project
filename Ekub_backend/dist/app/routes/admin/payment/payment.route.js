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
const PaymentController = __importStar(require("../../../controllers/admin/payment/payment.controller"));
const PaymentFilter = __importStar(require("../../../controllers/admin/payment/filter/payment.filter"));
const StaffAuthMiddleware = __importStar(require("../../../middlewares/staff-auth.middleware"));
const client_1 = require("@prisma/client");
const express_validator_1 = require("express-validator");
const validate_middleware_1 = require("../../../middlewares/validate.middleware");
const router = express_1.default.Router();
router
    .route("/")
    .get(StaffAuthMiddleware.verifyStaff, StaffAuthMiddleware.restrictStaff(client_1.Permissions.payment), PaymentFilter.getPayments, PaymentController.getPayments);
router
    .route("/paymentExport")
    .get(StaffAuthMiddleware.verifyStaff, StaffAuthMiddleware.restrictStaff(client_1.Permissions.payment), PaymentFilter.getPayments, PaymentController.getExportPayments);
router
    .route("/getPendingPayments")
    .get(PaymentController.getExportPayments);
router
    .route("/:id")
    .get(StaffAuthMiddleware.verifyStaff, StaffAuthMiddleware.restrictStaff(client_1.Permissions.payment), PaymentController.getPayment)
    .patch(StaffAuthMiddleware.verifyStaff, StaffAuthMiddleware.restrictStaff(client_1.Permissions.payment), [
    (0, express_validator_1.check)("approved")
        .isIn(["yes", "no"])
        .withMessage('approved must be either "yes" or "no"'),
    validate_middleware_1.validate,
], PaymentController.approvePayment);
exports.default = router;
