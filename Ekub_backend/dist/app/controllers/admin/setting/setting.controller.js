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
exports.deleteSetting = exports.updateSetting = exports.createSetting = exports.getSetting = exports.getSettingValueTypes = exports.getSettingTypes = exports.getSettings = void 0;
const db_config_1 = __importDefault(require("../../../config/db.config"));
const error_config_1 = require("../../../config/error.config");
const app_error_1 = __importDefault(require("../../../shared/errors/app.error"));
const client_1 = require("@prisma/client");
exports.getSettings = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const page = Number(query._page) || 1;
    const limit = Number(query._limit) || 10;
    const skip = Number((page - 1) * limit);
    const [settings, total] = yield Promise.all([db_config_1.default.setting.findMany({
            take: limit,
            skip,
        }), db_config_1.default.setting.count()]);
    res.status(200).json({
        status: "success",
        data: {
            settings,
            meta: {
                page,
                limit,
                total,
            },
        },
    });
}));
exports.getSettingTypes = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const settingTypes = Object.values(client_1.SettingType);
    res.status(200).json({
        status: "success",
        data: {
            settingTypes
        },
    });
}));
exports.getSettingValueTypes = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const settingTypes = Object.values(client_1.SettingTypeValue);
    res.status(200).json({
        status: "success",
        data: {
            settingTypes
        },
    });
}));
exports.getSetting = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const setting = yield db_config_1.default.setting.findUnique({
        where: {
            id: req.params.id,
        },
    });
    if (!setting) {
        return next(new app_error_1.default(`Setting with ID ${req.params.id} does not exist`, 400));
    }
    res.status(200).json({
        status: "success",
        data: {
            setting,
        },
    });
}));
exports.createSetting = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    client_1.SettingType;
    const setting = yield db_config_1.default.setting.create({
        data: req.body
    });
    res.status(200).json({
        status: "success",
        data: {
            setting,
        },
    });
}));
exports.updateSetting = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const setting = yield db_config_1.default.setting.update({ where: { id: req.params.id }, data: req.body });
    if (!setting) {
        return next(new app_error_1.default(`Setting with ID ${req.params.id} does not exist`, 400));
    }
    res.status(200).json({
        status: "success",
        data: {
            setting,
        },
    });
}));
exports.deleteSetting = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const setting = yield db_config_1.default.setting.delete({
        where: {
            id: req.params.id,
        },
    });
    if (!setting) {
        return next(new app_error_1.default(`Setting with ID ${req.params.id} does not exist`, 400));
    }
    res.status(200).json({
        status: "success",
        msg: 'setting deleted',
    });
}));
