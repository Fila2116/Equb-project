"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePaidRound = exports.calculatePaidAmount = void 0;
const calculatePaidAmount = (totalPaid, round, equbAmount) => {
    const expectedAmount = round * equbAmount;
    console.log("expectedAmount");
    console.log(expectedAmount);
    console.log("totalPaid");
    console.log(totalPaid);
    const paidAmount = Math.floor(expectedAmount) - totalPaid;
    if (paidAmount <= 0) {
        return equbAmount;
    }
    else {
        return equbAmount - paidAmount;
    }
};
exports.calculatePaidAmount = calculatePaidAmount;
const calculatePaidRound = (userEqubAmount, totalPaid) => {
    return Math.floor(totalPaid / userEqubAmount);
};
exports.calculatePaidRound = calculatePaidRound;
