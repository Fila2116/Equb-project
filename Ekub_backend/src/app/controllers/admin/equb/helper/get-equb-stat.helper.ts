import { Equb } from "@prisma/client";
import prisma from "../../../../config/db.config";

interface EqubStat {
  currentRound: number;
  equbAmount: number;
  totalMembers: number;
  totalPaidAmount: number;
  totalPaidMembers: number;
  totalUnPaidAmount: number;
  totalUnPaidMembers: number;
}
export const getEqubStatistics = async (equb: Equb): Promise<EqubStat> => {
  const equbers = await prisma.equber.findMany({
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
    if (equberPaidAmount >= 0) totalPaid = singleEqubAmount + equberPaidAmount;
    return sum + totalPaid;
  }, 0);

  const totalPaidMembers = equbers.filter((equber) => {
    const equberTotalPaidAmount = equber.totalPaid;
    const expectedPaymentAmount = singleEqubAmount * currentRound;
    const equberPaidAmount = equberTotalPaidAmount - expectedPaymentAmount;

    if (equberPaidAmount >= 0) return true;
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
};
