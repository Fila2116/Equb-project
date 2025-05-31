"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.equbersPaid = exports.structuredUserPayment = exports.structuredPayment = void 0;
const calculate_paid_amount_helper_1 = require("./calculate-paid-amount.helper");
const structuredPayment = (equb, userId) => {
    const equbers = equb.equbers;
    let payments = [];
    equbers
        .filter((equber) => equber.users.some((user) => user.user.id === userId))
        .forEach((equber) => {
        const equberUsers = equber.users.filter((user) => user.user.id === userId);
        equberUsers.forEach((equberUser) => {
            var _a;
            const rawEqubAmount = (Number(equb.equbAmount) * ((equberUser === null || equberUser === void 0 ? void 0 : equberUser.stake) || 0)) / 100;
            const userEqubAmount = Math.floor(rawEqubAmount);
            const totalPaid = equberUser === null || equberUser === void 0 ? void 0 : equberUser.totalPaid;
            const amountPaid = (0, calculate_paid_amount_helper_1.calculatePaidAmount)(Number(equber.totalPaid), Number(equb.currentRound), Number(userEqubAmount));
            console.log(`amountPaid`, amountPaid);
            console.log(`userEqubAmount`, userEqubAmount);
            const paidRound = (0, calculate_paid_amount_helper_1.calculatePaidRound)(userEqubAmount, totalPaid);
            payments.push({
                name: equber.isGruop
                    ? equber.users
                        .map((user) => { var _a; return (_a = user.user.fullName) === null || _a === void 0 ? void 0 : _a.charAt(0); })
                        .toString()
                        .toUpperCase()
                    : (_a = equber.users[0]) === null || _a === void 0 ? void 0 : _a.user.fullName,
                id: equber.id,
                isGroup: equber.isGruop,
                request: equber.lotteryRequest,
                lotteryNumber: equber.lotteryNumber,
                equberUserId: equberUser === null || equberUser === void 0 ? void 0 : equberUser.id,
                totalPaid,
                amountPaid,
                paidRound,
                equbAmount: userEqubAmount,
                paid: amountPaid >= userEqubAmount,
            });
        });
    });
    return payments;
};
exports.structuredPayment = structuredPayment;
const structuredUserPayment = (equb) => {
    const equbers = equb.equbers;
    let payments = [];
    equbers.forEach((equber) => {
        equber.users.forEach((equberUser) => {
            var _a;
            const rawEqubAmount = (Number(equb.equbAmount) * ((equberUser === null || equberUser === void 0 ? void 0 : equberUser.stake) || 0)) / 100;
            const userEqubAmount = Math.floor(rawEqubAmount);
            const totalPaid = equberUser === null || equberUser === void 0 ? void 0 : equberUser.totalPaid;
            const amountPaid = (0, calculate_paid_amount_helper_1.calculatePaidAmount)(Number(equber.totalPaid), Number(equb.currentRound), Number(userEqubAmount));
            console.log(`amountPaid`, amountPaid);
            console.log(`userEqubAmount`, userEqubAmount);
            const paidRound = (0, calculate_paid_amount_helper_1.calculatePaidRound)(userEqubAmount, totalPaid);
            payments.push({
                name: equber.isGruop
                    ? equber.users
                        .map((user) => { var _a; return (_a = user.user.fullName) === null || _a === void 0 ? void 0 : _a.charAt(0); })
                        .toString()
                        .toUpperCase()
                    : (_a = equber.users[0]) === null || _a === void 0 ? void 0 : _a.user.fullName,
                id: equber.id,
                isGroup: equber.isGruop,
                request: equber.lotteryRequest,
                lotteryNumber: equber.lotteryNumber,
                equberUserId: equberUser === null || equberUser === void 0 ? void 0 : equberUser.id,
                totalPaid,
                amountPaid,
                paidRound,
                equbAmount: userEqubAmount,
                paid: amountPaid >= userEqubAmount,
            });
        });
    });
    return payments;
};
exports.structuredUserPayment = structuredUserPayment;
const equbersPaid = (equb) => {
    const equbers = equb.equbers;
    return equbers.filter((equber) => {
        const amountPaid = (0, calculate_paid_amount_helper_1.calculatePaidAmount)(Number(equber.totalPaid), Number(equb.currentRound), Number(equb.equbAmount));
        return amountPaid >= equb.equbAmount;
    }).length;
};
exports.equbersPaid = equbersPaid;
