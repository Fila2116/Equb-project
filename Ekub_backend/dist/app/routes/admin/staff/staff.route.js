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
const StaffController = __importStar(require("../../../controllers/admin/staff/staff.controller"));
const StaffAuthMiddleware = __importStar(require("../../../middlewares/staff-auth.middleware"));
const client_1 = require("@prisma/client");
const express_validator_1 = require("express-validator");
const validate_middleware_1 = require("../../../middlewares/validate.middleware");
const router = express_1.default.Router();
router
    .route("/")
    .get(StaffAuthMiddleware.verifyStaff, StaffAuthMiddleware.restrictStaff(client_1.Permissions.staff), StaffController.getStaffs)
    .post(StaffAuthMiddleware.verifyStaff, StaffAuthMiddleware.restrictStaff(client_1.Permissions.staff), StaffController.uploadImage.pre, 
// StaffController.uploadImage.post,
[
    (0, express_validator_1.body)("firstName", "firstName is required").not().isEmpty(),
    (0, express_validator_1.body)("lastName", "lastName is required").not().isEmpty(),
    (0, express_validator_1.body)("email", "Valid email is required")
        .isEmail()
        .trim()
        .escape()
        .normalizeEmail(),
    (0, express_validator_1.body)("phoneNumber", "phoneNumber is required").not().isEmpty(),
    (0, express_validator_1.body)("roleId", "roleId is Invalid UUID format").isUUID(),
    // body("branchId", "branch Id is Invalid UUID format").optional().isUUID(),
    validate_middleware_1.validate,
], StaffController.createStaff);
router
    .route("/getStaffsWithOutPagination")
    .get(StaffAuthMiddleware.verifyStaff, StaffAuthMiddleware.restrictStaff(client_1.Permissions.staff), StaffController.getExportStaffs);
router
    .route("/:id")
    .get(StaffAuthMiddleware.verifyStaff, StaffAuthMiddleware.restrictStaff(client_1.Permissions.staff), StaffController.getStaff)
    .patch(StaffAuthMiddleware.verifyStaff, StaffAuthMiddleware.restrictStaff(client_1.Permissions.staff), StaffController.uploadImage.pre, 
// StaffController.uploadImage.post,
[
    (0, express_validator_1.body)("firstName", "firstName is required").not().isEmpty(),
    (0, express_validator_1.body)("lastName", "lastName is required").not().isEmpty(),
    (0, express_validator_1.body)("email", "Valid email is required")
        .isEmail()
        .trim()
        .escape()
        .normalizeEmail(),
    (0, express_validator_1.body)("phoneNumber", "phoneNumber is required").not().isEmpty(),
    (0, express_validator_1.body)("roleId", "roleId is Invalid UUID format").isUUID(),
    validate_middleware_1.validate,
], StaffController.updateStaff);
router
    .route("/deleteStaff/:id")
    .delete(StaffAuthMiddleware.verifyStaff, StaffAuthMiddleware.restrictStaff(client_1.Permissions.staff), StaffController.deleteStaff);
exports.default = router;
