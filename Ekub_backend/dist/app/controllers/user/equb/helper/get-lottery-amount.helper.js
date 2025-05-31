"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLotteryAmount = exports.getNetLotteryAmount = void 0;
const getNetLotteryAmount = (equb, stake) => {
    const totalEqubAmount = equb.equbAmount * equb.numberOfEqubers;
    const serviceCharge = (totalEqubAmount * equb.serviceCharge) / 100;
    const netEqubAmount = totalEqubAmount - serviceCharge;
    const equberUserStake = netEqubAmount * (stake / 100);
    return equberUserStake;
};
exports.getNetLotteryAmount = getNetLotteryAmount;
const getLotteryAmount = (equb, stake) => {
    const totalEqubAmount = equb.equbAmount * equb.numberOfEqubers;
    const equberUserStake = totalEqubAmount * (stake / 100);
    return equberUserStake;
};
exports.getLotteryAmount = getLotteryAmount;
