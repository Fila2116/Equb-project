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
const SettingController = __importStar(require("../../../controllers/admin/setting/setting.controller"));
const client_1 = require("@prisma/client");
const express_validator_1 = require("express-validator");
const validate_middleware_1 = require("../../../middlewares/validate.middleware");
const router = express_1.default.Router();
router
    .route("/")
    .get(
// StaffAuthMiddleware.verifyStaff,
// StaffAuthMiddleware.restrictStaff(Permissions.setting),
SettingController.getSettings)
    .post(
// StaffAuthMiddleware.verifyStaff,
// StaffAuthMiddleware.restrictStaff(Permissions.setting),
[
    (0, express_validator_1.check)('name').isIn([client_1.SettingType.notificationTime]).withMessage(`Valid setting names are ${client_1.SettingType.notificationTime} `),
    // check('value').isIn([SettingTypeValue.booleanValue, SettingTypeValue.numericValue,SettingTypeValue.validFrom,SettingTypeValue.validUntil]).withMessage(`Valid setting value types are ${SettingTypeValue.numericValue}, ${SettingTypeValue.booleanValue}, ${SettingTypeValue.validFrom} and ${SettingTypeValue.validUntil}.`),
    validate_middleware_1.validate
], SettingController.createSetting);
router
    .route("/types")
    .get(
// StaffAuthMiddleware.verifyStaff,
// StaffAuthMiddleware.restrictStaff(Permissions.setting),
SettingController.getSettingTypes);
router
    .route("/value-types")
    .get(
// StaffAuthMiddleware.verifyStaff,
// StaffAuthMiddleware.restrictStaff(Permissions.setting),
SettingController.getSettingValueTypes);
router
    .route("/:id")
    .get(
// StaffAuthMiddleware.verifyStaff,
// StaffAuthMiddleware.restrictStaff(Permissions.setting),
SettingController.getSetting)
    .patch(
// StaffAuthMiddleware.verifyStaff,
// StaffAuthMiddleware.restrictStaff(Permissions.setting),
[
    (0, express_validator_1.check)('name').isIn([client_1.SettingType.notificationTime]).withMessage(`Valid setting names are ${client_1.SettingType.notificationTime} `),
    // check('value').isIn([SettingTypeValue.booleanValue, SettingTypeValue.numericValue,SettingTypeValue.validFrom,SettingTypeValue.validUntil]).withMessage(`Valid setting value types are ${SettingTypeValue.numericValue}, ${SettingTypeValue.booleanValue}, ${SettingTypeValue.validFrom} and ${SettingTypeValue.validUntil}.`),
    validate_middleware_1.validate
], SettingController.updateSetting).delete(
// StaffAuthMiddleware.verifyStaff,
// StaffAuthMiddleware.restrictStaff(Permissions.setting),
SettingController.deleteSetting);
exports.default = router;
