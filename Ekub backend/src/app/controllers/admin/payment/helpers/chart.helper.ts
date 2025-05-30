import { EquberUserPayment } from "@prisma/client";
import prisma from "../../../../config/db.config";

export const ChartHelper = async (equberUserPayment: EquberUserPayment) => {
  const paidAmount = equberUserPayment.amount;
  const equberUser = await prisma.equberUser.findFirst({
    where: { id: equberUserPayment.equberUserId! },
  });
  const equber = await prisma.equber.findFirst({
    where: { id: equberUser?.equberId! },
  });
  const equb = await prisma.equb.findFirst({ where: { id: equber?.equbId! } });

  const equberHistory = await prisma.equberPaymentHistory.findFirst({
    where: {
      equberId: equber?.id,
      round: equb?.currentRound,
    },
  });

  if (equberHistory) {
    await prisma.equberPaymentHistory.update({
      where: { id: equberHistory.id },
      data: {
        totalPaid: {
          increment: paidAmount,
        },
      },
    });
  } else {
    await prisma.equberPaymentHistory.create({
      data: {
        round: equb?.currentRound!,
        totalPaid: paidAmount,
        expectedAmount: equb?.equbAmount! * equb?.currentRound!,
        equberId: equber?.id!,
      },
    });
  }
};
