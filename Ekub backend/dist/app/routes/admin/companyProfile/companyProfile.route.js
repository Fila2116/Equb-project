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
const CompanyProfileController = __importStar(require("../../../controllers/admin/companyProfile/companyProfile.controller"));
const StaffAuthMiddleware = __importStar(require("../../../middlewares/staff-auth.middleware"));
const client_1 = require("@prisma/client");
const express_validator_1 = require("express-validator");
const validate_middleware_1 = require("../../../middlewares/validate.middleware");
const router = express_1.default.Router();
router
    .route("/")
    .get(StaffAuthMiddleware.verifyStaff, StaffAuthMiddleware.restrictStaff(client_1.Permissions.all), CompanyProfileController.getCompanyProfile)
    .post(StaffAuthMiddleware.verifyStaff, StaffAuthMiddleware.restrictStaff(client_1.Permissions.all), [
    (0, express_validator_1.check)('country').not().isEmpty().withMessage('country is required.'),
    (0, express_validator_1.check)('city').not().isEmpty().withMessage('city is required.'),
    (0, express_validator_1.check)('address').not().isEmpty().withMessage('address is required.'),
    (0, express_validator_1.check)('email').not().isEmpty().withMessage('email is required.'),
    (0, express_validator_1.check)('tel').optional().isLength({ min: 10, max: 14 }).withMessage('Phone number must be at least 10 digits.'),
    validate_middleware_1.validate
], CompanyProfileController.createCompanyProfile);
router
    .route("/getCompanyProfileforHeader")
    .get(StaffAuthMiddleware.verifyStaff, StaffAuthMiddleware.restrictStaff(client_1.Permissions.all), CompanyProfileController.getCompanyProfileForHeader);
router
    .route("/:id")
    .patch(StaffAuthMiddleware.verifyStaff, StaffAuthMiddleware.restrictStaff(client_1.Permissions.all), [
    (0, express_validator_1.check)('country').not().isEmpty().withMessage('country is required.'),
    (0, express_validator_1.check)('city').not().isEmpty().withMessage('city is required.'),
    (0, express_validator_1.check)('address').not().isEmpty().withMessage('address is required.'),
    (0, express_validator_1.check)('email').not().isEmpty().withMessage('email is required.'),
    (0, express_validator_1.check)('tel').optional().isLength({ min: 10, max: 14 }).withMessage('Phone number must be at least 10 digits.'),
    validate_middleware_1.validate
], CompanyProfileController.updateCompanyProfile);
router
    .route("/deleteCompanyProfile/:id")
    .delete(StaffAuthMiddleware.verifyStaff, StaffAuthMiddleware.restrictStaff(client_1.Permissions.role), CompanyProfileController.deleteCompanyProfile);
exports.default = router;
