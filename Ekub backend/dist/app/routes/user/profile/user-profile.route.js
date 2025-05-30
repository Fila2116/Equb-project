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
const UserController = __importStar(require("../../../controllers/user/profile/user-profile.controller"));
const BankController = __importStar(require("../../../controllers/admin/bank/bank.controller"));
const UserAuthMiddleware = __importStar(require("../../../middlewares/user-auth.middleware"));
const client_1 = require("@prisma/client");
const express_validator_1 = require("express-validator");
const validate_middleware_1 = require("../../../middlewares/validate.middleware");
const router = express_1.default.Router();
router
    .route("/me")
    .get(UserAuthMiddleware.verifyUser, UserController.getMyProfile);
router
    .route("/banks")
    .get(UserAuthMiddleware.verifyUser, BankController.getBanks);
router
    .route("/profile-pic/:id")
    .patch(UserAuthMiddleware.verifyUser, UserAuthMiddleware.restrictUser, UserController.updateProfilePic);
router
    .route("/personal-info/:id")
    .patch(UserAuthMiddleware.verifyUser, UserAuthMiddleware.restrictUser, UserController.uploadImage.pre, [
    (0, express_validator_1.body)('firstName').not().isEmpty().withMessage('firstName is required.'),
    (0, express_validator_1.body)('lastName').not().isEmpty().withMessage('lastName is required.'),
    (0, express_validator_1.body)('phoneNumber').not().isEmpty().withMessage('phoneNumber is required.'),
    (0, express_validator_1.body)('gender').isIn(['male', 'female']).withMessage(`Valid gender values are ${client_1.Gender.female} and ${client_1.Gender.male}.`),
    validate_middleware_1.validate
], UserController.updatePersonalInfo);
router.route('/financial-info').get(UserAuthMiddleware.verifyUser, UserController.getMyBankAccounts);
router
    .route("/financial-info/:id")
    .patch(UserAuthMiddleware.verifyUser, UserAuthMiddleware.restrictUser, [
    (0, express_validator_1.check)('bankId').isUUID().withMessage('bankId is required.'),
    (0, express_validator_1.check)('accountName').not().isEmpty().withMessage('Account name is required.'),
    (0, express_validator_1.check)('accountNumber').isInt().withMessage('A valid account number is required.'),
    validate_middleware_1.validate
], UserController.addBankAccount);
router
    .route("/bank-account/:id")
    .patch(UserAuthMiddleware.verifyUser, 
// UserAuthMiddleware.restrictUser,
[
    (0, express_validator_1.check)('accountName').not().isEmpty().withMessage('Account name is required.'),
    (0, express_validator_1.check)('accountNumber').isInt().withMessage('A valid account number is required.'),
    validate_middleware_1.validate
], UserController.updateBankAccount);
exports.default = router;
