"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reportData_controller_1 = require("../../../controllers/user/report/reportData.controller");
const reportData_controller_2 = require("../../../controllers/admin/report/reportData.controller");
const router = express_1.default.Router();
router.route("/generalReport").get(reportData_controller_2.generalReport);
// Detailed report for a specific Equb
router.route("/:id").get(reportData_controller_1.getReport);
// General report
// User-specific report
router.route("/userReport/:userId").get(reportData_controller_2.SpecificReport);
exports.default = router;
