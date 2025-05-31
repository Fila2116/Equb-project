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
exports.updateRole = exports.createRole = exports.getRole = exports.getRoles = void 0;
const db_config_1 = __importDefault(require("../../../config/db.config"));
const error_config_1 = require("../../../config/error.config");
const app_error_1 = __importDefault(require("../../../shared/errors/app.error"));
const client_1 = require("@prisma/client");
exports.getRoles = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const page = Number(query._page) || 1;
    const limit = Number(query._limit) || 10;
    const skip = Number((page - 1) * limit);
    const filter = {};
    // Add search functionality
    if (query._search) {
        filter.OR = [
            {
                name: {
                    contains: query._search,
                    mode: "insensitive",
                },
            },
        ];
    }
    const [roles, total] = yield Promise.all([
        db_config_1.default.role.findMany({
            where: filter,
            take: limit,
            skip,
        }),
        db_config_1.default.role.count({ where: filter }),
    ]);
    res.status(200).json({
        status: "success",
        data: {
            roles,
            meta: {
                page,
                limit,
                total,
            },
        },
    });
}));
exports.getRole = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const role = yield db_config_1.default.role.findUnique({
        where: {
            id: req.params.id,
        },
    });
    if (!role) {
        return next(new app_error_1.default(`Role with ID ${req.params.id} does not exist`, 400));
    }
    res.status(200).json({
        status: "success",
        data: {
            role,
        },
    });
}));
exports.createRole = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { name, description, permissions } = req.body;
    const role = yield db_config_1.default.role.create({
        data: {
            type: "custom",
            description: description,
            permissions: permissions,
            name: name,
        },
    });
    yield db_config_1.default.activity.create({
        data: {
            action: client_1.Permissions.role,
            staffId: (_a = req.staff) === null || _a === void 0 ? void 0 : _a.id,
            roleId: role.id,
            description: `${(_b = req.staff) === null || _b === void 0 ? void 0 : _b.fullName} created a new role - ${role.name}.`,
        },
    });
    res.status(200).json({
        status: "success",
        data: {
            role,
        },
    });
}));
exports.updateRole = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    const { name, description, permissions } = req.body;
    const role = yield db_config_1.default.role.update({
        where: { id: req.params.id },
        data: {
            name: name,
            description: description,
            permissions: permissions,
        },
    });
    if (!role) {
        return next(new app_error_1.default(`Role with ID ${req.params.id} does not exist`, 400));
    }
    yield db_config_1.default.activity.create({
        data: {
            action: client_1.Permissions.role,
            staffId: (_c = req.staff) === null || _c === void 0 ? void 0 : _c.id,
            roleId: role.id,
            description: `${(_d = req.staff) === null || _d === void 0 ? void 0 : _d.fullName} updated a role `,
        },
    });
    res.status(200).json({
        status: "success",
        data: {
            role,
        },
    });
}));
