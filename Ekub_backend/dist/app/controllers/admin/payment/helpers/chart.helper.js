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
exports.ChartHelper = void 0;
const db_config_1 = __importDefault(require("../../../../config/db.config"));
const ChartHelper = (equberUserPayment) => __awaiter(void 0, void 0, void 0, function* () {
    const paidAmount = equberUserPayment.amount;
    const equberUser = yield db_config_1.default.equberUser.findFirst({
        where: { id: equberUserPayment.equberUserId },
    });
    const equber = yield db_config_1.default.equber.findFirst({
        where: { id: equberUser === null || equberUser === void 0 ? void 0 : equberUser.equberId },
    });
    const equb = yield db_config_1.default.equb.findFirst({ where: { id: equber === null || equber === void 0 ? void 0 : equber.equbId } });
    const equberHistory = yield db_config_1.default.equberPaymentHistory.findFirst({
        where: {
            equberId: equber === null || equber === void 0 ? void 0 : equber.id,
            round: equb === null || equb === void 0 ? void 0 : equb.currentRound,
        },
    });
    if (equberHistory) {
        yield db_config_1.default.equberPaymentHistory.update({
            where: { id: equberHistory.id },
            data: {
                totalPaid: {
                    increment: paidAmount,
                },
            },
        });
    }
    else {
        yield db_config_1.default.equberPaymentHistory.create({
            data: {
                round: equb === null || equb === void 0 ? void 0 : equb.currentRound,
                totalPaid: paidAmount,
                expectedAmount: (equb === null || equb === void 0 ? void 0 : equb.equbAmount) * (equb === null || equb === void 0 ? void 0 : equb.currentRound),
                equberId: equber === null || equber === void 0 ? void 0 : equber.id,
            },
        });
    }
});
exports.ChartHelper = ChartHelper;
