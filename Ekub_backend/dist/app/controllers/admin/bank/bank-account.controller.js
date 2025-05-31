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
exports.updateBankAccount = exports.createBankAccount = exports.getBankAccount = exports.getAllBankAccounts = exports.getBankAccounts = void 0;
const db_config_1 = __importDefault(require("../../../config/db.config"));
const error_config_1 = require("../../../config/error.config");
const app_error_1 = __importDefault(require("../../../shared/errors/app.error"));
const client_1 = require("@prisma/client");
exports.getBankAccounts = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const page = Number(query._page) || 1;
    const limit = Number(query._limit) || 10;
    const skip = Number((page - 1) * limit);
    const [companyBankAccounts, total] = yield Promise.all([db_config_1.default.companyBankAccount.findMany({
            take: limit,
            skip,
        }), db_config_1.default.companyBankAccount.count()]);
    res.status(200).json({
        status: "success",
        data: {
            companyBankAccounts,
            meta: {
                page,
                limit,
                total,
            },
        },
    });
}));
exports.getAllBankAccounts = (0, error_config_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const [companyBankAccounts, totalCount] = yield Promise.all([
        db_config_1.default.companyBankAccount.findMany(),
        db_config_1.default.companyBankAccount.count()
    ]);
    res.status(200).json({
        status: "success",
        data: {
            companyBankAccounts,
            totalCount
        },
    });
}));
exports.getBankAccount = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const companyBankAccount = yield db_config_1.default.companyBankAccount.findUnique({
        where: {
            id: req.params.id,
        },
    });
    if (!companyBankAccount) {
        return next(new app_error_1.default(`Company bank account with ID ${req.params.id} does not exist`, 400));
    }
    res.status(200).json({
        status: "success",
        data: {
            companyBankAccount,
        },
    });
}));
exports.createBankAccount = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { accountName, accountNumber } = req.body;
    const companyBankAccount = yield db_config_1.default.companyBankAccount.create({
        data: {
            accountName: accountName,
            accountNumber: accountNumber
        }
    });
    yield db_config_1.default.activity.create({
        data: {
            action: client_1.Permissions.company_bank,
            staffId: (_a = req.staff) === null || _a === void 0 ? void 0 : _a.id,
            companyBankAccountId: companyBankAccount.id,
            description: `${(_b = req.staff) === null || _b === void 0 ? void 0 : _b.fullName} added a new Company Bank account - ${companyBankAccount.accountName} , ${companyBankAccount.accountNumber}.`
        }
    });
    res.status(200).json({
        status: "success",
        data: {
            companyBankAccount,
        },
    });
}));
exports.updateBankAccount = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    const { accountName, accountNumber } = req.body;
    const updatedData = {
        accountName, accountNumber
    };
    const companyBankAccount = yield db_config_1.default.companyBankAccount.update({ where: { id: req.params.id }, data: updatedData });
    if (!companyBankAccount) {
        return next(new app_error_1.default(`Company Bank Account with ID ${req.params.id} does not exist`, 400));
    }
    yield db_config_1.default.activity.create({
        data: {
            action: client_1.Permissions.company_bank,
            staffId: (_c = req.staff) === null || _c === void 0 ? void 0 : _c.id,
            companyBankAccountId: companyBankAccount.id,
            description: `${(_d = req.staff) === null || _d === void 0 ? void 0 : _d.fullName} updated a Company Bank Account - ${companyBankAccount.accountName}, ${companyBankAccount.accountNumber}.`
        }
    });
    res.status(200).json({
        status: "success",
        data: {
            companyBankAccount,
        },
    });
}));
