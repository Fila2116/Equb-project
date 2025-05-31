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
exports.getEqubStatistics = void 0;
const db_config_1 = __importDefault(require("../../../../config/db.config"));
const getEqubStatistics = (equb) => __awaiter(void 0, void 0, void 0, function* () {
    const equbers = yield db_config_1.default.equber.findMany({
        where: {
            equbId: equb.id,
        },
        include: {
            users: {
                include: { user: true },
            },
        },
    });
    const currentRound = equb.currentRound;
    const singleEqubAmount = equb.equbAmount;
    const totalMembers = equbers.length;
    const equbAmount = equb.equbAmount * equb.numberOfEqubers;
    const totalPaidAmount = equbers.reduce((sum, equber) => {
        let totalPaid = 0;
        const equberTotalPaidAmount = equber.totalPaid;
        const expectedPaymentAmount = singleEqubAmount * currentRound;
        const equberPaidAmount = equberTotalPaidAmount - expectedPaymentAmount;
        if (equberPaidAmount >= 0)
            totalPaid = singleEqubAmount + equberPaidAmount;
        return sum + totalPaid;
    }, 0);
    const totalPaidMembers = equbers.filter((equber) => {
        const equberTotalPaidAmount = equber.totalPaid;
        const expectedPaymentAmount = singleEqubAmount * currentRound;
        const equberPaidAmount = equberTotalPaidAmount - expectedPaymentAmount;
        if (equberPaidAmount >= 0)
            return true;
        return false;
    }).length;
    const totalExpectedPaymentAmount = singleEqubAmount * totalMembers;
    console.log("totalExpectedPaymentAmount");
    console.log(totalExpectedPaymentAmount);
    const totalUnpaidAmount = totalExpectedPaymentAmount - totalPaidAmount;
    const totalUnPaidMembers = totalMembers - totalPaidMembers;
    return {
        currentRound,
        equbAmount,
        totalMembers,
        totalPaidAmount,
        totalPaidMembers,
        totalUnPaidAmount: totalUnpaidAmount <= 0 ? 0 : totalUnpaidAmount,
        totalUnPaidMembers,
    };
});
exports.getEqubStatistics = getEqubStatistics;
