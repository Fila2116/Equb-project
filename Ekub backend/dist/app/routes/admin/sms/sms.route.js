"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const validate_middleware_1 = require("../../../middlewares/validate.middleware");
const sms_controller_1 = require("../../../controllers/admin/sms/sms.controller");
const router = express_1.default.Router();
// Validation middleware for SMS API
router.post("/", [(0, express_validator_1.check)("message").notEmpty().withMessage("Message is required")], validate_middleware_1.validate, // Middleware to handle validation errors
sms_controller_1.sendBulkSms);
exports.default = router;
