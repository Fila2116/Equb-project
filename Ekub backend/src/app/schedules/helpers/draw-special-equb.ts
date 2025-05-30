import { Equb } from "@prisma/client";
import prisma from "../../config/db.config";
import {
  getEligibleEqubers,
  getEligibleEqubersForRequest,
} from "../../controllers/admin/equb/helper/get-eligible-equbers.helper";
import { selectRandomWinners } from "../draw-lottery.job";

export const drawSpecialEqub = async (equbId: string) => {
  const equb = await prisma.equb.findUnique({
    where: { id: equbId },
    include: {
      equbType: true,
      equbCategory: true,
      equbers: {
        include: {
          users: { include: { user: true } },
        },
      },
    },
  });

  if (!equb) {
    console.log(`Equb with ID ${equbId} not found.`);
    return null;
  }

  const { currentRound, nextRoundLotteryType, equbType, equbers, nextRoundDate } = equb;
  console.log("Specical Equb....:", equb);
  console.log("Equb exists:", equb.name);
  console.log("Current Round:", currentRound);
  console.log("Next Round Type:", nextRoundLotteryType);

  // Fetch the current status of the Equb to avoid overwrites
  const currentEqub = await prisma.equb.findUnique({
    where: { id: equbId },
    select: { status: true },
  });

  if (currentEqub?.status === "completed") {
    console.log(`Equb ${equbId} is already completed. Skipping.`);
    return;
  }
   if (nextRoundLotteryType === "request") {
    console.log("request Here:");
    const eligibleEqubers = await getEligibleEqubersForRequest(equbId);
    console.log("Eligible Equbers for Request:", eligibleEqubers);

    if (eligibleEqubers.length > 0) {
      const winners = await selectRandomWinners(eligibleEqubers, equb.currentRoundWinners);
      console.log("Winners for Request:", winners);

      if (winners.length > 0) {
        // Update each winner
        for (const winner of winners) {
          await prisma.equber.update({
            where: { id: winner.id },
            data: {
              winRound: currentRound,
              hasWonEqub: true,
            },
          });
        }

        const totalEqubers = await prisma.equber.count({ where: { equbId } });
        const totalWonEqubers = await prisma.equber.count({
          where: { equbId, hasWonEqub: true },
        });

        const updatedData: any = totalEqubers === totalWonEqubers
          ? { status: "completed" }
          : {
              nextRoundDate: calculateNextRoundDate(nextRoundDate, equbType.interval),
              nextRoundLotteryType: "finance",
              status: "started",
            };

        updatedData.currentRound = { increment: winners.length };
        updatedData.previousRound = currentRound;
        updatedData.hasLastRoundWinner=true

        const updatedEqub = await prisma.equb.update({
          where: { id: equbId },
          data: updatedData,
        });

        console.log("Equb Updated (Request):", updatedEqub);
      } else {
        console.log(`No winners for request round in ${equb.name}`);
      }
    } else {
      console.log(`No eligible users for request round in ${equb.name}`);
      await handleNoEligibleUsers(equb, equbType.interval);
    }
  }
  else if (nextRoundLotteryType === "finance") {
    console.log("Finance Here:");
    const eligibleEqubers = await getEligibleEqubers(equbers, currentRound, equb.equbAmount);
    console.log("Eligible Equbers:", eligibleEqubers);

    if (eligibleEqubers.length > 0) {
      const winners = await selectRandomWinners(eligibleEqubers, equb.currentRoundWinners);
      console.log("Winners:", winners);

      if (winners.length > 0) {
        // Update each winner
        for (const winner of winners) {
          await prisma.equber.update({
            where: { id: winner.id },
            data: {
              winRound: currentRound,
              hasWonEqub: true,
            },
          });
        }

        const totalEqubers = await prisma.equber.count({ where: { equbId } });
        const totalWonEqubers = await prisma.equber.count({
          where: { equbId, hasWonEqub: true },
        });

        const updatedData: any = totalEqubers === totalWonEqubers
          ? { status: "completed" }
          : {
              nextRoundDate: calculateNextRoundDate(nextRoundDate, equbType.interval),
              nextRoundLotteryType: "request",
              status: "started",
            };

        updatedData.currentRound = { increment: winners.length };
        updatedData.previousRound = currentRound;
        updatedData.hasLastRoundWinner=true

        const updatedEqub = await prisma.equb.update({
          where: { id: equbId },
          data: updatedData,
        });

        console.log("Equb Updated:", updatedEqub);
      } else {
        console.log(`No winners for Equb ${equb.name}`);
      }
    } else {
      console.log(`No eligible users for finance round in ${equb.name}`);
      await handleNoEligibleUsers(equb, equbType.interval);
    }
  } 
};

const calculateNextRoundDate = (currentDate: Date | null, interval: number) => {
  const nextDate = new Date(currentDate || Date.now());
  nextDate.setDate(nextDate.getDate() + interval);
  return nextDate;
};

const handleNoEligibleUsers = async (equb: Equb, interval: number) => {
  const nextRoundDate = calculateNextRoundDate(equb.nextRoundDate, interval);
  await prisma.equb.update({
    where: { id: equb.id },
    data: {
      nextRoundDate,
      status: "started",
      hasLastRoundWinner: false,
    },
  });
  console.log(`Updated Equb ${equb.name} with no eligible users.`);
};
