import { EquberUserPayment } from "@prisma/client";
import prisma from "../../../../config/db.config";
import { updateEquberUserPaymentScore } from "../../../user/payment/helper/payment-score.helper";
import { updateEquberFinancePoints } from "../../../../utils/updateFinancialPoint";
import { ChartHelper } from "./chart.helper";

export const approveEquberPayments = async (
  equberUserPayments: EquberUserPayment[]
) => {
  console.log(equberUserPayments);
  console.log("equberUserPayments");
  for (let i = 0; i < equberUserPayments.length; i++) {
    const equberUserPayment = equberUserPayments[i];

    const equberUser = await prisma.equberUser.update({
      where: { id: equberUserPayment.equberUserId! },
      data: {
        totalPaid: {
          increment: equberUserPayment.amount,
        },
      },
    });
    const equber = await prisma.equber.update({
      where: { id: equberUser.equberId! },
      data: {
        totalPaid: {
          increment: equberUserPayment.amount,
        },
      },
    });

     ChartHelper(equberUserPayment);

     updateEquberFinancePoints(equber.id, equberUserPayment.paymentId);
    const equbId = equber.equbId!;
     updateEquberUserPaymentScore(
      equberUser.id,
      equbId,
      equberUserPayment.createdAt
    );
  }
};
