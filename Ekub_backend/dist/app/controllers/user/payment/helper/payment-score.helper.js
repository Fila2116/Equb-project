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
exports.updateEquberUserPaymentScore = void 0;
const db_config_1 = __importDefault(require("../../../../config/db.config"));
function updateEquberUserPaymentScore(equberUserId, equbId, paidAt) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('got on payment score update function.');
            const equberUser = yield db_config_1.default.equberUser.findUnique({ where: { id: equberUserId } });
            console.log('equberUser');
            console.log(equberUser);
            if (!equberUser)
                throw new Error('equberUser not found');
            const equb = yield db_config_1.default.equb.findUnique({ where: { id: equbId }, include: { equbType: true } });
            console.log('equb');
            console.log(equb);
            if (!equb)
                throw new Error('equb not found');
            const { equbType: { interval }, currentRound, equbAmount, startDate } = equb;
            const { totalPaid, paymentScoreCalculatedRound } = equberUser;
            const expectedPaidAmount = currentRound * equbAmount;
            if (totalPaid >= expectedPaidAmount) {
                const equbStartDate = new Date(startDate);
                let scoreAdjustment = 0;
                for (let i = paymentScoreCalculatedRound; i < currentRound; i++) {
                    const dueDate = addDays(equbStartDate, interval * i);
                    console.log('dueDate');
                    console.log(dueDate);
                    const daysLate = Math.ceil((paidAt.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
                    console.log('daysLate');
                    console.log(daysLate);
                    if (daysLate <= 0) {
                        scoreAdjustment = scoreAdjustment + 10; // Early or on-time payment
                    }
                    else if (daysLate <= 2) {
                        scoreAdjustment = scoreAdjustment - 5; // Slightly late
                    }
                    else {
                        scoreAdjustment = scoreAdjustment - 10; // Very late
                    }
                }
                yield db_config_1.default.equberUser.update({
                    where: { id: equberUserId },
                    data: {
                        paymentScore: {
                            increment: scoreAdjustment,
                        },
                        paymentScoreCalculatedRound: currentRound
                    },
                });
            }
        }
        catch (error) {
            console.log(`Error on updating equber user payment score`);
        }
    });
}
exports.updateEquberUserPaymentScore = updateEquberUserPaymentScore;
function updateUserScore(userId, dueDate, paidAt, extraDays) {
    return __awaiter(this, void 0, void 0, function* () {
        // Add extra days to the due date
        const adjustedDueDate = addDays(dueDate, extraDays); // This will be a Date object
        // Calculate the difference in days (adjustedDueDate and paidAt are both Date objects)
        const daysLate = Math.ceil((paidAt.getTime() - adjustedDueDate.getTime()) / (1000 * 60 * 60 * 24));
        let scoreAdjustment = 0;
        // Apply scoring logic based on the modified due date
        if (daysLate <= 0) {
            scoreAdjustment = 10; // Early or on-time payment
        }
        else if (daysLate <= 7) {
            scoreAdjustment = -5; // Slightly late
        }
        else {
            scoreAdjustment = -10; // Very late
        }
    });
}
function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}
