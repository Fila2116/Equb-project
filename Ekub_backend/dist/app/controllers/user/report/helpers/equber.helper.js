"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.structuredEqubers = void 0;
const structuredEqubers = (equb, userId) => {
    const equbers = equb.equbers;
    console.log(equbers);
    let payments = [];
    equbers
        .filter((equber) => { var _a; return (_a = equber.users) === null || _a === void 0 ? void 0 : _a.some((user) => user.user.id === userId); })
        .forEach((equber) => {
        var _a;
        const equberUsers = ((_a = equber.users) === null || _a === void 0 ? void 0 : _a.filter((user) => user.user.id === userId)) || [];
        equberUsers.forEach((equberUser) => {
            const userEqubAmount = Number(equb.equbAmount * (equberUser === null || equberUser === void 0 ? void 0 : equberUser.stake)) / 100;
            const totalPaid = equberUser === null || equberUser === void 0 ? void 0 : equberUser.totalPaid;
            payments.push({
                lotteryNumber: equber.lotteryNumber,
                totalPaid,
                claimAmount: equberUser.claimAmount,
                payments: equberUser.payments,
                guarantee: equberUser.guaranteeUser || equberUser.guarantee || "No Guarantee",
            });
        });
    });
    return payments;
};
exports.structuredEqubers = structuredEqubers;
