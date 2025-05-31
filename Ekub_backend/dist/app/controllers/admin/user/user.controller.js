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
exports.deleteUser = exports.approveUser = exports.getUser = exports.getUsers = void 0;
const db_config_1 = __importDefault(require("../../../config/db.config"));
const error_config_1 = require("../../../config/error.config");
const app_error_1 = __importDefault(require("../../../shared/errors/app.error"));
const client_1 = require("@prisma/client");
const kycPoint_1 = require("../../../utils/kycPoint");
exports.getUsers = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const page = Number(query._page) || 1;
    const limit = Number(query._limit) || 10;
    const skip = Number((page - 1) * limit);
    // Get the start and end date from the query
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;
    const search = query._search ? query._search.toString() : "";
    const whereClause = {};
    if (search) {
        whereClause.OR = [
            {
                firstName: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                fullName: {
                    contains: search,
                    mode: "insensitive",
                },
            },
        ];
    }
    // Add date filtering to the where clause if startDate and endDate are provided
    if (startDate && endDate) {
        whereClause.createdAt = {
            gte: startDate,
            lte: endDate,
        };
    }
    // console.log("startDate", startDate);
    // console.log("endDate", endDate);
    // console.log("whereClause", whereClause);
    const [users, total] = yield Promise.all([
        db_config_1.default.user.findMany({
            where: whereClause,
            include: { joinedEqubs: true },
            take: limit,
            skip,
        }),
        db_config_1.default.user.count({ where: whereClause }),
    ]);
    res.status(200).json({
        status: "success",
        data: {
            users,
            meta: {
                page,
                limit,
                total,
            },
        },
    });
}));
exports.getUser = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield db_config_1.default.user.findUnique({
        where: {
            id: req.params.id,
        },
        include: { joinedEqubs: true },
    });
    if (!user) {
        return next(new app_error_1.default(`User with ID ${req.params.id} does not exist`, 400));
    }
    res.status(200).json({
        status: "success",
        data: {
            user,
        },
    });
}));
exports.approveUser = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { decision, decline_reason } = req.body;
    const updatedData = {
        isVerified: decision === "yes" ? true : false,
    };
    if (decline_reason) {
        updatedData.decline_reason = decline_reason;
    }
    const user = yield db_config_1.default.user.update({
        where: { id: req.params.id },
        data: updatedData,
        include: { joinedEqubs: true },
    });
    if (!user) {
        return next(new app_error_1.default(`User with ID ${req.params.id} does not exist`, 400));
    }
    console.log("id user controller", req.params.id);
    (0, kycPoint_1.addKycPoint)(req.params.id);
    yield db_config_1.default.activity.create({
        data: {
            action: client_1.Permissions.user,
            staffId: (_a = req.staff) === null || _a === void 0 ? void 0 : _a.id,
            userId: user.id,
            description: `${(_b = req.staff) === null || _b === void 0 ? void 0 : _b.fullName} ${decision === "yes" ? "approved" : "declined"} a user - ${user.fullName}.`,
        },
    });
    res.status(200).json({
        status: "success",
        data: {
            user,
        },
    });
}));
exports.deleteUser = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    // Delete related records in the EquberUser table
    yield db_config_1.default.equberUser.deleteMany({
        where: {
            userId: userId,
        },
    });
    yield db_config_1.default.payment.deleteMany({
        where: {
            userId: userId,
        },
    });
    yield db_config_1.default.notification.deleteMany({
        where: {
            userId: userId,
        },
    });
    // Delete the User record
    const user = yield db_config_1.default.user.delete({
        where: {
            id: userId,
        },
    });
    res.status(200).json({
        status: "success",
    });
}));
