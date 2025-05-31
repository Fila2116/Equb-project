import {
  Equb,
  Equber,
  EquberUser,
  EquberUserPayment,
  LotteryRequest,
  Payment,
  User,
  DeviceToken,
  EqubType,
  Guarantee,
} from "@prisma/client";
import {
  calculatePaidAmount,
  calculatePaidRound,
} from "./calculate-paid-amount.helper";
export type PopulatedEquber = Equber & {
  lotteryRequest: LotteryRequest;
  users: (EquberUser & {
    user: User & {
      deviceTokens: DeviceToken[];
    };
    payments: EquberUserPayment[];
    guaranteeUser: User;
    guarantee: Guarantee;
  })[];
  payments: Payment[];

  equb: Equb;
};
export type PopulatedEqub = Equb & {
  equbers: PopulatedEquber[];
  equbType: EqubType;
};
export const structuredPayment = (equb: PopulatedEqub, userId: string) => {
  const equbers = equb.equbers;
  let payments: any[] = [];
  equbers
    .filter((equber) => equber.users.some((user) => user.user.id === userId))
    .forEach((equber) => {
      const equberUsers = equber.users.filter(
        (user) => user.user.id === userId
      );
      equberUsers.forEach((equberUser) => {
        const rawEqubAmount =
          (Number(equb.equbAmount) * (equberUser?.stake || 0)) / 100;
        const userEqubAmount = Math.floor(rawEqubAmount);
        const totalPaid = equberUser?.totalPaid;
        const amountPaid = calculatePaidAmount(
          Number(equber.totalPaid),
          Number(equb.currentRound),
          Number(userEqubAmount)
        );

        console.log(`amountPaid`, amountPaid);
        console.log(`userEqubAmount`, userEqubAmount);
        const paidRound = calculatePaidRound(userEqubAmount, totalPaid);
        payments.push({
          name: equber.isGruop
            ? equber.users
                .map((user) => user.user.fullName?.charAt(0))
                .toString()
                .toUpperCase()
            : equber.users[0]?.user.fullName,
          id: equber.id,
          isGroup: equber.isGruop,
          request: equber.lotteryRequest,
          lotteryNumber: equber.lotteryNumber,
          equberUserId: equberUser?.id,
          totalPaid,
          amountPaid,
          paidRound,
          equbAmount: userEqubAmount,
          paid: amountPaid >= userEqubAmount,
        });
      });
    });
  return payments;
};

export const structuredUserPayment = (equb: PopulatedEqub) => {
  const equbers = equb.equbers;
  let payments: any[] = [];
  equbers.forEach((equber) => {
    equber.users.forEach((equberUser) => {
      const rawEqubAmount =
        (Number(equb.equbAmount) * (equberUser?.stake || 0)) / 100;
      const userEqubAmount = Math.floor(rawEqubAmount);
      const totalPaid = equberUser?.totalPaid;
      const amountPaid = calculatePaidAmount(
        Number(equber.totalPaid),
        Number(equb.currentRound),
        Number(userEqubAmount)
      );

      console.log(`amountPaid`, amountPaid);
      console.log(`userEqubAmount`, userEqubAmount);
      const paidRound = calculatePaidRound(userEqubAmount, totalPaid);
      payments.push({
        name: equber.isGruop
          ? equber.users
              .map((user) => user.user.fullName?.charAt(0))
              .toString()
              .toUpperCase()
          : equber.users[0]?.user.fullName,
        id: equber.id,
        isGroup: equber.isGruop,
        request: equber.lotteryRequest,
        lotteryNumber: equber.lotteryNumber,
        equberUserId: equberUser?.id,
        totalPaid,
        amountPaid,
        paidRound,
        equbAmount: userEqubAmount,
        paid: amountPaid >= userEqubAmount,
      });
    });
  });
  return payments;
};
export const equbersPaid = (equb: PopulatedEqub) => {
  const equbers = equb.equbers;

  return equbers.filter((equber) => {
    const amountPaid = calculatePaidAmount(
      Number(equber.totalPaid),
      Number(equb.currentRound),
      Number(equb.equbAmount)
    );
    return amountPaid >= equb.equbAmount;
  }).length;
};
