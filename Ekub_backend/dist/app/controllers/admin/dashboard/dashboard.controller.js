"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEqubStat = void 0;
const db_config_1 = __importDefault(require("../../../config/db.config"));
const error_config_1 = require("../../../config/error.config");
exports.getEqubStat = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const [equbers, equbs, activeEqubs, closedEqubs] = yield Promise.all([
        db_config_1.default.equber.count(),
        db_config_1.default.equb.count(),
        db_config_1.default.equb.count({ where: { status: 'started' } }),
        db_config_1.default.equb.count({ where: { status: 'completed' } }),
    ]);
    res.status(200).json({
        status: "success",
        data: {
            statistics: {
                equbs,
                equbers,
                activeEqubs,
                closedEqubs
            },
        },
    });
}));
