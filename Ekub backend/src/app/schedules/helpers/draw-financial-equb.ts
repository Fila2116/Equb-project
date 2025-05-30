import { Equb } from "@prisma/client";
import prisma from "../../config/db.config";
import {
  getEligibleEqubers,
  getEligibleEqubersForRequest,
} from "../../controllers/admin/equb/helper/get-eligible-equbers.helper";
import { selectRandomWinners } from "../draw-lottery.job";
import { PopulatedEqub } from "../../controllers/user/equb/helper/payment.helper";

export const drawFinancialEqub = async (equbId: string) => {
  console.log("Am here financial equal", equbId);
  const equb = await prisma.equb.findUnique({
    where: {
      id: equbId,
    },
    include: {
      equbType: true,
      equbCategory: true,
      equbers: {
        include: {
          users: {
            include: { user: true },
          },
        },
      },
    },
  });
  // console.log("equb", equb);
  // console.log("equb from direct financial equb", equb?.currentRound);
  if (!equb) return null;

  const eligibleEqubers = await getEligibleEqubers(
    equb.equbers,
    equb.currentRound,
    equb.equbAmount
  );
  const eligibleEqubersLotteryNo = eligibleEqubers
    .map((eq) => eq.lotteryNumber)
    .toString();
  console.log("elligibeEqubers : ", eligibleEqubersLotteryNo);
  console.log(`Current round winners length: `, equb.currentRoundWinners);

  if (eligibleEqubers.length > 0) {
    const winners = await selectRandomWinners(
      eligibleEqubers,
      equb.currentRoundWinners
    );
    const winnersLotteryNo = winners.map((eq) => eq.lotteryNumber).toString();
    console.log("winners : ", winners);
    if (winners.length > 0) {
      // await prisma.lottery.create({
      //   data: {
      //     equbId: equb.id,
      //     winners: winnersLotteryNo,
      //     eligibleEqubers: eligibleEqubersLotteryNo,
      //     round: equb.currentRound,
      //   },
      // });
      // Update each winner's winRound
      for (const winner of winners) {
        //   const updatedEqub = (await prisma.equb.findUnique({where:{id:equb.id}})) as unknown as Equb
        const currentRound = equb.currentRound;
        console.log("current round on wnners func", currentRound);
        await prisma.equber.update({
          where: { id: winner.id },
          data: {
            winRound: currentRound,
            hasWonEqub: true,
          },
        });
      }
      await prisma.equb.update({
        where: { id: equb.id },
        data: {
          currentRound: { increment: winners.length },
          previousRound: equb.currentRound,
          hasLastRoundWinner: true,
        },
      });
      let updatedData: any = {};
      const latestEqub = (await prisma.equb.findUnique({
        where: { id: equb.id },
        include: { equbers: true },
      })) as unknown as PopulatedEqub;
      const totalEqubersInEqub = latestEqub.equbers.length;
      const totalWonEqubersInEqub = latestEqub.equbers.filter(
        (equber) => equber.hasWonEqub
      ).length;
      if (totalEqubersInEqub == totalWonEqubersInEqub) {
        updatedData = {
          status: "completed",
        };
      } else {
        // Calculate the next round date
        const nextRoundDate = new Date(equb.nextRoundDate || new Date());
        nextRoundDate.setDate(nextRoundDate.getDate() + equb.equbType.interval);
        updatedData = {
          nextRoundDate: nextRoundDate,
          nextRoundLotteryType: "request",
          status: "started",
        };
      }

      // Set nextRoundLotteryType to null if the equbCategory is Car, House, or Travel
      if (["Car", "House", "Travel"].includes(equb.equbCategory.name)) {
        updatedData.nextRoundDate = null;
      }

      await prisma.equb.update({
        where: { id: equb.id },
        data: updatedData,
      });
    } else {
      console.log(`No participantsincrement for Equb ${equb.name}`);
    }
  } else {
    console.log(`No eligible users to draw lottery for ${equb.name}`);
    let nextRoundDate: Date | null = new Date(equb.nextRoundDate || new Date());
    nextRoundDate.setDate(nextRoundDate.getDate() + equb.equbType.interval);
    if (["Car", "House", "Travel"].includes(equb.equbCategory.name)) {
      nextRoundDate = null;
    }
    await prisma.equb.update({
      where: { id: equb.id },
      data: {
        nextRoundDate: nextRoundDate,
        status: "started",
        hasLastRoundWinner: false,
      },
    });
  }
};
