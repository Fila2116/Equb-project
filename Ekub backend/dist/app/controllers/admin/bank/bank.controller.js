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
exports.deleteCompanyBank = exports.deleteBank = exports.updateBank = exports.createBank = exports.getBank = exports.getBanks = void 0;
const db_config_1 = __importDefault(require("../../../config/db.config"));
const error_config_1 = require("../../../config/error.config");
const app_error_1 = __importDefault(require("../../../shared/errors/app.error"));
const client_1 = require("@prisma/client");
exports.getBanks = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const page = Number(query._page) || 1;
    const limit = Number(query._limit) || 10;
    const skip = Number((page - 1) * limit);
    const [banks, total] = yield Promise.all([
        db_config_1.default.bank.findMany({
            take: limit,
            skip,
        }),
        db_config_1.default.bank.count(),
    ]);
    res.status(200).json({
        status: "success",
        data: {
            banks,
            meta: {
                page,
                limit,
                total,
            },
        },
    });
}));
exports.getBank = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const bank = yield db_config_1.default.bank.findUnique({
        where: {
            id: req.params.id,
        },
    });
    if (!bank) {
        return next(new app_error_1.default(`Bank with ID ${req.params.id} does not exist`, 400));
    }
    res.status(200).json({
        status: "success",
        data: {
            bank,
        },
    });
}));
exports.createBank = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { name, description } = req.body;
    const bank = yield db_config_1.default.bank.create({
        data: {
            name: name,
            description: description ? description : "",
        },
    });
    yield db_config_1.default.activity.create({
        data: {
            action: client_1.Permissions.bank,
            staffId: (_a = req.staff) === null || _a === void 0 ? void 0 : _a.id,
            bankId: bank.id,
            description: `${(_b = req.staff) === null || _b === void 0 ? void 0 : _b.fullName} added a new Bank - ${bank.name}.`,
        },
    });
    res.status(200).json({
        status: "success",
        data: {
            bank,
        },
    });
}));
exports.updateBank = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    const { name, description } = req.body;
    const updatedData = {
        name,
    };
    if (description)
        updatedData.description = description;
    const bank = yield db_config_1.default.bank.update({
        where: { id: req.params.id },
        data: updatedData,
    });
    if (!bank) {
        return next(new app_error_1.default(`Bank with ID ${req.params.id} does not exist`, 400));
    }
    yield db_config_1.default.activity.create({
        data: {
            action: client_1.Permissions.bank,
            staffId: (_c = req.staff) === null || _c === void 0 ? void 0 : _c.id,
            bankId: bank.id,
            description: `${(_d = req.staff) === null || _d === void 0 ? void 0 : _d.fullName} updated a Bank.`,
        },
    });
    res.status(200).json({
        status: "success",
        data: {
            bank,
        },
    });
}));
exports.deleteBank = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield db_config_1.default.bankAccount.deleteMany({
        where: {
            bankId: req.params.id,
        },
    });
    // Delete the bank
    const bank = yield db_config_1.default.bank.delete({
        where: {
            id: req.params.id,
        },
    });
    res.status(200).json({
        status: "success",
        message: "Bank deleted successfully",
    });
}));
exports.deleteCompanyBank = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const bank = yield db_config_1.default.companyBankAccount.delete({
        where: {
            id: req.params.id,
        },
    });
    if (!bank) {
        return next(new app_error_1.default(`Bank with ID ${req.params.id} does not exist`, 400));
    }
    res.status(200).json({
        status: "success",
        message: "Bank deleted successfully",
    });
}));
