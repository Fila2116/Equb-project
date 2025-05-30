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
exports.getReport = void 0;
const error_config_1 = require("../../../config/error.config");
const db_config_1 = __importDefault(require("../../../config/db.config"));
const app_error_1 = __importDefault(require("../../../shared/errors/app.error"));
const equber_helper_1 = require("./helpers/equber.helper");
exports.getReport = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const equb = (yield db_config_1.default.equb.findUnique({
        where: { id: req.params.id },
        include: {
            equbType: true,
            equbers: {
                include: {
                    payments: true,
                    users: {
                        include: {
                            user: true,
                            payments: true,
                            guaranteeUser: true,
                            guarantee: true,
                        },
                    },
                },
            },
        },
    }));
    console.log("userId", (_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
    if (!equb) {
        return next(new app_error_1.default(`Equb with ID ${req.params.id} does not exist`, 400));
    }
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
    const report = {
        equbName: equb.name,
        equbType: equb.equbType,
        equbers: (0, equber_helper_1.structuredEqubers)(equb, userId),
    };
    res.status(200).json({
        status: "success",
        data: report,
    });
}));
