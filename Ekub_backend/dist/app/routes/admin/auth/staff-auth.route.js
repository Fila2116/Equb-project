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
const express_validator_1 = require("express-validator");
const staff_auth_controller_1 = __importDefault(require("../../../controllers/admin/auth/staff-auth.controller"));
const validate_middleware_1 = require("../../../middlewares/validate.middleware");
const StaffAuthMiddleware = __importStar(require("../../../middlewares/staff-auth.middleware"));
const router = express_1.default.Router();
// Log in staff
router.post("/login", [
    (0, express_validator_1.check)("email").isEmail().withMessage("Please include a valid email."),
    (0, express_validator_1.check)("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),
], validate_middleware_1.validate, staff_auth_controller_1.default.loginStaff);
router.get("/", StaffAuthMiddleware.verifyStaff, staff_auth_controller_1.default.getStaff);
router.post("/forgot-password", [
    (0, express_validator_1.check)("emailOrPhoneNumber")
        .not()
        .isEmpty()
        .withMessage("Please insert your Phone Number or email ."),
], validate_middleware_1.validate, staff_auth_controller_1.default.forgotPassword);
//Signup user Google Auth
router.post("/reset-password", [
    (0, express_validator_1.check)("otp").not().isEmpty().withMessage("Please insert otp code.")
], validate_middleware_1.validate, staff_auth_controller_1.default.resetPassword);
// verify in staff
router.post("/verify", StaffAuthMiddleware.verifyStaff, staff_auth_controller_1.default.verify);
// SEND OTP TO ADMIN
router.post("/sendOtpToAdmin", StaffAuthMiddleware.verifyStaff, validate_middleware_1.validate, staff_auth_controller_1.default.sendOtpToAdmin);
exports.default = router;
