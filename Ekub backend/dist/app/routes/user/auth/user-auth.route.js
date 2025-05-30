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
const user_auth_controller_1 = __importDefault(require("../../../controllers/user/auth/user-auth.controller"));
const validate_middleware_1 = require("../../../middlewares/validate.middleware");
const UserAuthMiddleware = __importStar(require("../../../middlewares/user-auth.middleware"));
const router = express_1.default.Router();
//Send otp
router.post("/otp", [(0, express_validator_1.check)("to").not().isEmpty().withMessage("Phone number and email required")], validate_middleware_1.validate, user_auth_controller_1.default.sendOtp);
// Sign up customer/user
router.post("/signup", user_auth_controller_1.default.uploadImage.pre, [
    (0, express_validator_1.body)("firstName").not().isEmpty().withMessage("First name is required."),
    (0, express_validator_1.body)("lastName").not().isEmpty().withMessage("Last name is required."),
    (0, express_validator_1.body)("phoneNumber")
        .isLength({ min: 13, max: 13 })
        .withMessage("Phone number is required. (13 digits)"),
    (0, express_validator_1.body)("password")
        .isLength({ min: 4 })
        .withMessage("Pin must be at least 4 characters long"),
    validate_middleware_1.validate,
], validate_middleware_1.validate, user_auth_controller_1.default.signupUser);
// Log in user
router.post("/login", [
    (0, express_validator_1.check)("phoneNumber")
        .custom((value) => {
        const isEmail = /^[^\s@]+@(gmail\.com|companyname\.com)$/.test(value);
        const isPhone = /^\+251\d{9}$/.test(value); // Adjust length as per your requirements
        console.log("isEmail", isEmail);
        console.log("isPhone", isPhone);
        if (!isEmail && !isPhone) {
            throw new Error("Must be a valid email or phone number");
        }
        return true;
    }),
    (0, express_validator_1.check)("password")
        .isLength({ min: 4 })
        .withMessage("Pin must be 4 characters long"),
], validate_middleware_1.validate, user_auth_controller_1.default.loginUser);
router.get("/", UserAuthMiddleware.verifyUser, user_auth_controller_1.default.getUser);
//Signup user Google Auth
router.post("/refresh-token", user_auth_controller_1.default.refreshToken);
router.post("/forgot-password", [
    (0, express_validator_1.check)("phoneNumber")
        .not()
        .isEmpty()
        .withMessage("Please insert your PhoneNumber or email ."),
], validate_middleware_1.validate, user_auth_controller_1.default.forgotPassword);
//Signup user Google Auth
router.post("/reset-password", [
    (0, express_validator_1.check)("otp").not().isEmpty().withMessage("Please insert otp code."),
    (0, express_validator_1.check)("password")
        .isLength({ min: 4 })
        .withMessage("Pin must be 4 characters long"),
], validate_middleware_1.validate, user_auth_controller_1.default.resetPassword);
exports.default = router;
