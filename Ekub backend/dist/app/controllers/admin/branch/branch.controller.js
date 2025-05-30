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
exports.updateBranch = exports.createBranch = exports.getBranch = exports.getBranches = void 0;
const db_config_1 = __importDefault(require("../../../config/db.config"));
const error_config_1 = require("../../../config/error.config");
const app_error_1 = __importDefault(require("../../../shared/errors/app.error"));
const client_1 = require("@prisma/client");
exports.getBranches = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const page = Number(query._page) || 1;
    const limit = Number(query._limit) || 10;
    const skip = Number((page - 1) * limit);
    const [branches, total] = yield Promise.all([db_config_1.default.branch.findMany({
            take: limit,
            skip,
        }), db_config_1.default.branch.count()]);
    res.status(200).json({
        status: "success",
        data: {
            branches,
            meta: {
                page,
                limit,
                total,
            },
        },
    });
}));
exports.getBranch = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const branch = yield db_config_1.default.branch.findUnique({
        where: {
            id: req.params.id,
        },
    });
    if (!branch) {
        return next(new app_error_1.default(`Branch with ID ${req.params.id} does not exist`, 400));
    }
    res.status(200).json({
        status: "success",
        data: {
            branch,
        },
    });
}));
exports.createBranch = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { name, city, phoneNumber } = req.body;
    const branch = yield db_config_1.default.branch.create({
        data: {
            name: name,
            city: city,
            phoneNumber: phoneNumber ? phoneNumber : ''
        }
    });
    yield db_config_1.default.activity.create({
        data: {
            action: client_1.Permissions.branch,
            staffId: (_a = req.staff) === null || _a === void 0 ? void 0 : _a.id,
            branchId: branch.id,
            description: `${(_b = req.staff) === null || _b === void 0 ? void 0 : _b.fullName} created a new branch - ${branch.name}.`
        }
    });
    res.status(200).json({
        status: "success",
        data: {
            branch,
        },
    });
}));
exports.updateBranch = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    const { name, city, phoneNumber } = req.body;
    const updatedData = {
        name, city, phoneNumber
    };
    if (phoneNumber)
        updatedData.phoneNumber = phoneNumber;
    const branch = yield db_config_1.default.branch.update({ where: { id: req.params.id }, data: updatedData,
    });
    if (!branch) {
        return next(new app_error_1.default(`Branch with ID ${req.params.id} does not exist`, 400));
    }
    yield db_config_1.default.activity.create({
        data: {
            action: client_1.Permissions.branch,
            staffId: (_c = req.staff) === null || _c === void 0 ? void 0 : _c.id,
            description: `${(_d = req.staff) === null || _d === void 0 ? void 0 : _d.fullName} updated a branch.`,
            branchId: branch.id
        }
    });
    res.status(200).json({
        status: "success",
        data: {
            branch,
        },
    });
}));
