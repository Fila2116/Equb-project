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
exports.SpecificReport = exports.getReport = exports.generalReport = void 0;
const error_config_1 = require("../../../config/error.config");
const db_config_1 = __importDefault(require("../../../config/db.config"));
const app_error_1 = __importDefault(require("../../../shared/errors/app.error"));
const equber_helper_1 = require("../../user/report/helpers/equber.helper");
// General Report
exports.generalReport = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // const payments = await prisma.payment.findMany({
    //   include: {
    //     equb: true,
    //     user: true,
    //     equbber: true,
    //   },
    // });
    const payments = yield db_config_1.default.payment.findMany({
        select: {
            equb: {
                select: {
                    name: true,
                    equbAmount: true,
                },
            },
            user: {
                select: {
                    username: true,
                    email: true,
                    phoneNumber: true,
                },
            },
            equbber: {
                select: {
                    lotteryNumber: true,
                    paidRound: true,
                },
            },
            id: true,
            type: true,
            amount: true,
            approved: true,
        },
    });
    const groupedPayments = payments.reduce((acc, payment) => {
        if (!acc[payment.type])
            acc[payment.type] = [];
        acc[payment.type].push(payment);
        return acc;
    }, {});
    res.status(200).json({ success: true, data: groupedPayments });
}));
exports.getReport = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
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
    if (!equb) {
        return next(new app_error_1.default(`Equb with ID ${req.params.id} does not exist`, 400));
    }
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    // Ensuring equb is not null and passing it safely to structuredEqubers
    const report = {
        equbName: equb.name,
        equbType: equb.equbType,
        equbers: (0, equber_helper_1.structuredEqubers)(equb, userId), // Now equb is guaranteed to be non-null
    };
    res.status(200).json({ success: true, data: report });
}));
// User-Specific Report
exports.SpecificReport = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const userPayments = yield db_config_1.default.payment.findMany({
        where: { userId },
        include: {
            equb: true,
            equbber: true,
        },
    });
    res.status(200).json({ success: true, data: userPayments });
}));
