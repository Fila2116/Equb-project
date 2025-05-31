import {
  Equb,
  Equber,
  EquberRequest,
  EquberUser,
  EquberUserPayment,
  Payment,
  User,
} from "@prisma/client";
import prisma from "../../../../config/db.config";
import { updateEquberUserPaymentScore } from "../../../user/payment/helper/payment-score.helper";
import { ChartHelper } from "./chart.helper";

function generateLotteryNumber(): string {
  const digits = Math.floor(Math.random() * 900) + 100; // Generates a number between 100 and 999
  const letters = Array.from({ length: 3 }, () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26))
  ).join(""); // Generates three random uppercase letters

  return `${digits}${letters}`;
}

function generateCustomLotteryNumber(equbCategoryName: string, equbTypeName: string): string {
  const categoryPrefix = equbCategoryName.slice(0, 1).toUpperCase();
  const typePrefix = equbTypeName.slice(0, 1).toUpperCase();
  const randomDigits = Math.floor(Math.random() * 9000) + 1000; // Generates a number between 1000 and 9999
  // const randomLetters = Array.from({ length: 2 }, () =>
  //   String.fromCharCode(65 + Math.floor(Math.random() * 26))
  // ).join(""); // Generates two random uppercase letters

  return `${categoryPrefix}${typePrefix}${randomDigits}`;
}

function calculateTotalPaid(users: EquberUser[]): number {
  return users.reduce((total, user) => total + user.totalPaid, 0);
}

export const findExistingGroups = async (
  equbId: string,
  stake: number
): Promise<Equber[]> => {
  const equb = await prisma.equb.findUnique({
    where: { id: equbId },
    include: {
      equbers: {
        include: {
          users: true,
        },
      },
    },
  });
  if (!equb) return [];
  return equb.equbers.filter(
    (equber) =>
      equber.isGruop &&
      equber.filledPercent !== 100 &&
      equber.users[0].stake == stake
  );
};
export type PopulatedEquberRequest = EquberRequest & {
  users: (EquberUser & {
    user: User;
    payments: EquberUserPayment[];
  })[];
  payments: Payment[];

  equb: Equb;
};

export const deleteEquberRequests = async (
  equberRequests: PopulatedEquberRequest[]
) => {
  console.log("got here to delete");
  console.log(equberRequests);

  for (let i = 0; i < equberRequests.length; i++) {
    const equberRequest = equberRequests[i];
    console.log("equberRequest");
    console.log(equberRequest);

    console.log("equberRequest.users");
    console.log(equberRequest.users);
    for (let j = 0; j < equberRequest.users.length; j++) {
      const equberUser = equberRequest.users[j];
      await prisma.equberUser.delete({ where: { id: equberUser.id } });
    }

    await prisma.equberRequest.delete({ where: { id: equberRequest.id } });
  }
};
export const deleteEquberRequestsOnly = async (
  equberRequests: PopulatedEquberRequest[]
) => {
  console.log("got here to delete");
  console.log(equberRequests);

  for (let i = 0; i < equberRequests.length; i++) {
    const equberRequest = equberRequests[i];
    console.log("equberRequest");
    console.log(equberRequest);

    await prisma.equberRequest.delete({ where: { id: equberRequest.id } });
  }
};
export const createEqubers = async (
  equberRequests: PopulatedEquberRequest[]
) => {
  console.log(equberRequests);
  for (let i = 0; i < equberRequests.length; i++) {
    const equberRequest = equberRequests[i];
    console.log(`Is group : ${equberRequest.isGruop}`);

    const equb = await prisma.equb.findUnique({
      where: { id: equberRequest.equbId! },
      include: {
        equbCategory: true,
        equbType: true,
      },
    });

    if (!equb) {
      throw new Error(`Equb with ID ${equberRequest.equbId} does not exist`);
    }

    const lotteryNumber = generateCustomLotteryNumber(equb.equbCategory.name, equb.equbType.name);

    if (equberRequest.isGruop) {
      const existingGroups = await findExistingGroups(
        equberRequest.equbId!,
        equberRequest.users[0].stake
      );
      console.log("existingGroups");
      console.log(existingGroups);

      if (existingGroups.length > 0) {
        const existingEquber = await prisma.equber.findUnique({
          where: { id: existingGroups[0].id },
        });

        const { userId, stake, totalPaid, user, payments } =
          equberRequest.users[0];

        const equber = await prisma.equber.update({
          where: { id: existingEquber?.id },
          data: {
            users: {
              create: {
                userId: userId,
                stake: stake,
                totalPaid: totalPaid,
                payments: {
                  create: payments.map((payment) => ({
                    amount: payment.amount,
                    payment: { connect: { id: payment.paymentId } },
                  })),
                },
              },
            },
            filledPercent: {
              increment: stake,
            },
            totalPaid: {
              increment: totalPaid,
            },
          },
          include: {
            users: {
              include: {
                user: true,
                payments: true,
              },
            },
          },
        });

        for (const equberUser of equber.users) {
          const equbId = equber.equbId!;
          await updateEquberUserPaymentScore(
            equberUser.id,
            equbId,
            equberUser.payments[0].createdAt
          );
          console.log("equberUSER fromequber.helper.ts", equberUser);
          ChartHelper(equberUser.payments[0]);
        }
      } else {
        const equber = await prisma.equber.create({
          data: {
            lotteryNumber: lotteryNumber,
            hasWonEqub: false,
            equbId: equberRequest.equbId,
            isGruop: true,
            users: {
              create: equberRequest.users.map((user) => ({
                userId: user.userId,
                stake: user.stake,
                totalPaid: user.totalPaid,
                payments: {
                  create: user.payments.map((payment) => ({
                    amount: payment.amount,
                    payment: { connect: { id: payment.paymentId } },
                  })),
                },
              })),
            },
            dividedBy: equberRequest.dividedBy,
            payments: {
              connect: equberRequest.payments.map((payment) => ({
                id: payment.id,
              })),
            },
            filledPercent: equberRequest.users[0].stake,
            totalPaid: calculateTotalPaid(equberRequest.users),
            paidRound: 0,
            financePoint: 0,
            kycPoint: 0,
            adminPoint: 0,
            totalEligibilityPoint: 0,
            included: false,
            excluded: false,
            show: true,
            winRound: null,
          },
          include: {
            users: {
              include: {
                user: true,
                payments: true,
              },
            },
            payments: true,
          },
        });
        for (const equberUser of equber.users) {
          const equbId = equber.equbId!;
          await updateEquberUserPaymentScore(
            equberUser.id,
            equbId,
            equberUser.payments[0].createdAt
          );
          console.log("equber User payment", equberUser.payments[0]);

          ChartHelper(equberUser.payments[0]);
        }
      }
    } else {
      const equber = await prisma.equber.create({
        data: {
          lotteryNumber: lotteryNumber, // Assuming a function to generate lottery numbers
          hasWonEqub: equberRequest.hasWonEqub,
          equbId: equberRequest.equbId,
          isGruop: false,
          users: {
            create: equberRequest.users.map((user) => ({
              userId: user.userId,
              stake: user.stake,
              totalPaid: user.totalPaid,
              payments: {
                create: user.payments.map((payment) => ({
                  amount: payment.amount,
                  payment: { connect: { id: payment.paymentId } },
                })),
              },
            })),
          },
          dividedBy: equberRequest.dividedBy,
          payments: {
            connect: equberRequest.payments.map((payment) => ({
              id: payment.id,
            })),
          },
          filledPercent: 100,
          totalPaid: calculateTotalPaid(equberRequest.users), // Assuming a function to calculate total paid
          paidRound: 0, // Assuming starting round is 0
          financePoint: 0, // Assuming finance point starts at 0
          kycPoint: 0, // Assuming KYC point starts at 0
          adminPoint: 0, // Assuming admin point starts at 0
          totalEligibilityPoint: 0, // Assuming eligibility point starts at 0
          included: false, // Assuming included starts as false
          excluded: false, // Assuming excluded starts as false
          show: true, // Assuming show starts as true
          winRound: null, // Assuming winRound starts as null
        },
        include: {
          users: {
            include: {
              user: true,
              payments: true,
            },
          },
        },
      });
      const equberUser = equber.users[0];
      const equbId = equber.equbId!;
      updateEquberUserPaymentScore(
        equberUser.id,
        equbId,
        equberUser.payments[0].createdAt
      );

      console.log("equber User payment", equberUser.payments[0]);
      ChartHelper(equberUser.payments[0]);
    }
  }
};
