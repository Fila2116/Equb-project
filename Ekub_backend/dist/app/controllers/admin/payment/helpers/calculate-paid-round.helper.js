"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePaidRounds = void 0;
const calculatePaidRounds = (totalPaid, equbAmount) => {
    console.log(`totalPaid: ${totalPaid}`);
    console.log(`equbAmount: ${equbAmount}`);
    return Math.floor(totalPaid / equbAmount);
};
exports.calculatePaidRounds = calculatePaidRounds;
