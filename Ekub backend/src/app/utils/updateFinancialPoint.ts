import prisma from "../config/db.config";

export const updateEquberFinancePoints = async (
  equberId: string,
  paymentId: string
) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { equbber: true, equb: true },
    });
    const equber = await prisma.equber.findUnique({
      where: { id: equberId },
    });
    const financePoints = equber?.financePoint;
    const adminPoints = equber?.adminPoint;
    const kycPoints = equber?.kycPoint;

    if (!payment || !payment.equb || !equber) {
      throw new Error("Payment or associated equber not found");
    }
    const equbs = payment.equb;

    const expectedPaidAmount = equbs.currentRound * equbs.equbAmount;
    const totalPaid = equber.totalPaid;

    console.log("totalPaid", totalPaid);
    console.log("expectedPaidAmount", expectedPaidAmount);

    if (totalPaid >= expectedPaidAmount) {
      const updatedEquber = await prisma.equber.update({
        where: { id: equber.id },
        data: {
          financePoint: {
            increment: 20,
          },
          totalEligibilityPoint:
            financePoints! + adminPoints! + kycPoints! + 20,
        },
      });

      return updatedEquber;
    }
  } catch (error) {
    console.error("Error updating finance points:", error);
    throw new Error("Failed to update finance points.");
  }
};

export const resetFinancePoint = async (equbId: string) => {
  try {
    const equb = await prisma.equb.findUnique({
      where: { id: equbId },
      include: { equbers: true },
    });

    if (!equb) {
      throw new Error(`Equb with ID ${equbId} not found.`);
    }

    const equberIds = Array.from(
      new Set(equb.equbers.map((equber) => equber.id))
    );

    for (const equberId of equberIds) {
      const equberPoint = await prisma.equber.findUnique({
        where: { id: equberId },
        select: {
          financePoint: true,
          adminPoint: true,
          kycPoint: true,
        },
      });

      if (!equberPoint) {
        console.warn(`Equber record with ID ${equberId} not found.`);
        continue;
      }

      console.log(`Resetting finance point for Equber ID: ${equberId}`);

      const { financePoint = 0, adminPoint = 0, kycPoint = 0 } = equberPoint;

      console.log("Fetched equberPoint:", equberPoint);

      const updatedEquber = await prisma.equber.update({
        where: { id: equberId },
        data: {
          financePoint: 0,
          adminPoint: 0,
          kycPoint: kycPoint,
          totalEligibilityPoint: kycPoint,
        },
      });

      console.log("updatedEquber", updatedEquber);

      console.log(
        `Finance points reset for Equber records associated with Equb ID: ${equbId}`
      );
    }
  } catch (error) {
    console.error("Error resetting finance points:", error);
    throw new Error("Failed to reset finance points.");
  }
};
