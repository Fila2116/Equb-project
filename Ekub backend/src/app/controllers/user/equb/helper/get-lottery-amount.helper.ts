import { Equb } from "@prisma/client";

export const getNetLotteryAmount = (equb: Equb, stake: number): number => {
  const totalEqubAmount = equb.equbAmount * equb.numberOfEqubers;
  const serviceCharge = (totalEqubAmount * equb.serviceCharge) / 100;
  const netEqubAmount = totalEqubAmount - serviceCharge;
  const equberUserStake = netEqubAmount * (stake / 100);

  return equberUserStake;
};

export const getLotteryAmount = (equb: Equb, stake: number): number => {
  const totalEqubAmount = equb.equbAmount * equb.numberOfEqubers;
  const equberUserStake = totalEqubAmount * (stake / 100);

  return equberUserStake;
};