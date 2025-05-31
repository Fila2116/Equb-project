import {
  calculatePaidAmount,
  calculatePaidRound,
} from "../../equb/helper/calculate-paid-amount.helper";
import { PopulatedEqub } from "../../equb/helper/payment.helper";

export const structuredEqubers = (equb: PopulatedEqub, userId: string) => {
  const equbers = equb.equbers;
  console.log(equbers);
  let payments: any[] = [];

  equbers
    .filter((equber) => equber.users?.some((user) => user.user.id === userId))
    .forEach((equber) => {
      const equberUsers =
        equber.users?.filter((user) => user.user.id === userId) || [];
      equberUsers.forEach((equberUser) => {
        const userEqubAmount =
          Number(equb.equbAmount * equberUser?.stake!) / 100;
        const totalPaid = equberUser?.totalPaid;

        payments.push({
          lotteryNumber: equber.lotteryNumber,
          totalPaid,
          claimAmount: equberUser.claimAmount,
          payments: equberUser.payments,
          guarantee:
            equberUser.guaranteeUser || equberUser.guarantee || "No Guarantee",
        });
      });
    });

  return payments;
};
