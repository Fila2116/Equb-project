import prisma from "../config/db.config";

export async function addKycPoint(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        equberUsers: {
          include: { equber: true },
        },
      },
    });

    if (!user || !user.equberUsers || user.equberUsers.length === 0) {
      throw new Error("User or associated Equber records not found");
    }

    // Collect all valid equberId values
    const equberIds = Array.from(
      new Set(
        user.equberUsers
          .filter((equberUser) => Boolean(equberUser.equberId))
          .map((equberUser) => equberUser.equberId!)
      )
    );

    console.log("equberIds", equberIds);

    if (equberIds.length === 0) {
      console.warn("No valid equberId found for the user.");
      return;
    }

    for (const equberId of equberIds) {
      const equber = await prisma.equber.findUnique({
        where: { id: equberId },
        select: {
          financePoint: true,
          adminPoint: true,
          kycPoint: true,
        },
      });

      if (!equber) {
        console.warn(`Equber record with ID ${equberId} not found.`);
        continue;
      }

      const { financePoint = 0, adminPoint = 0, kycPoint = 0 } = equber;

      await prisma.equber.update({
        where: { id: equberId },
        data: {
          kycPoint: 20,
          totalEligibilityPoint: financePoint + adminPoint + kycPoint,
        },
      });
    }

    console.log(
      `KYC points incremented by 20 for ${equberIds.length} Equber records.`
    );
  } catch (error) {
    console.error("Error adding KYC points:", error);
    throw error;
  }
}
