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
exports.approveEquberPayments = void 0;
const db_config_1 = __importDefault(require("../../../../config/db.config"));
const payment_score_helper_1 = require("../../../user/payment/helper/payment-score.helper");
const updateFinancialPoint_1 = require("../../../../utils/updateFinancialPoint");
const chart_helper_1 = require("./chart.helper");
const approveEquberPayments = (equberUserPayments) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(equberUserPayments);
    console.log("equberUserPayments");
    for (let i = 0; i < equberUserPayments.length; i++) {
        const equberUserPayment = equberUserPayments[i];
        const equberUser = yield db_config_1.default.equberUser.update({
            where: { id: equberUserPayment.equberUserId },
            data: {
                totalPaid: {
                    increment: equberUserPayment.amount,
                },
            },
        });
        const equber = yield db_config_1.default.equber.update({
            where: { id: equberUser.equberId },
            data: {
                totalPaid: {
                    increment: equberUserPayment.amount,
                },
            },
        });
        (0, chart_helper_1.ChartHelper)(equberUserPayment);
        (0, updateFinancialPoint_1.updateEquberFinancePoints)(equber.id, equberUserPayment.paymentId);
        const equbId = equber.equbId;
        (0, payment_score_helper_1.updateEquberUserPaymentScore)(equberUser.id, equbId, equberUserPayment.createdAt);
    }
});
exports.approveEquberPayments = approveEquberPayments;
