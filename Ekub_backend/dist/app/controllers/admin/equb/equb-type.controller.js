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
exports.updateEqubType = exports.createEqubType = exports.getEqubType = exports.getEqubTypes = void 0;
const db_config_1 = __importDefault(require("../../../config/db.config"));
const error_config_1 = require("../../../config/error.config");
const app_error_1 = __importDefault(require("../../../shared/errors/app.error"));
const client_1 = require("@prisma/client");
exports.getEqubTypes = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const page = Number(query._page) || 1;
    const limit = Number(query._limit) || 10;
    const skip = Number((page - 1) * limit);
    const [equbTypes, total] = yield Promise.all([db_config_1.default.equbType.findMany({
            take: limit,
            skip,
        }), db_config_1.default.equbType.count()]);
    res.status(200).json({
        status: "success",
        data: {
            equbTypes,
            meta: {
                page,
                limit,
                total,
            },
        },
    });
}));
exports.getEqubType = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const equbType = yield db_config_1.default.equbType.findUnique({
        where: {
            id: req.params.id,
        },
    });
    if (!equbType) {
        return next(new app_error_1.default(`Equb type with ID ${req.params.id} does not exist`, 400));
    }
    res.status(200).json({
        status: "success",
        data: {
            equbType,
        },
    });
}));
exports.createEqubType = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { name, description, interval } = req.body;
    const equbType = yield db_config_1.default.equbType.create({
        data: {
            name: name,
            description: description ? description : '',
            interval: Number(interval)
        }
    });
    yield db_config_1.default.activity.create({
        data: {
            action: client_1.Permissions.equb_type,
            staffId: (_a = req.staff) === null || _a === void 0 ? void 0 : _a.id,
            equbTypeId: equbType.id,
            description: `${(_b = req.staff) === null || _b === void 0 ? void 0 : _b.fullName} created a new equb type - ${equbType.name}.`
        }
    });
    res.status(200).json({
        status: "success",
        data: {
            equbType,
        },
    });
}));
exports.updateEqubType = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    const { name, description, interval } = req.body;
    const updatedData = {
        name,
        interval: Number(interval)
    };
    if (description)
        updatedData.description = description;
    const equbType = yield db_config_1.default.equbType.update({ where: { id: req.params.id }, data: updatedData });
    if (!equbType) {
        return next(new app_error_1.default(`Equb type with ID ${req.params.id} does not exist`, 400));
    }
    yield db_config_1.default.activity.create({
        data: {
            action: client_1.Permissions.equb_type,
            staffId: (_c = req.staff) === null || _c === void 0 ? void 0 : _c.id,
            description: `${(_d = req.staff) === null || _d === void 0 ? void 0 : _d.fullName} updated an equb type`,
            equbTypeId: equbType.id
        }
    });
    res.status(200).json({
        status: "success",
        data: {
            equbType,
        },
    });
}));
