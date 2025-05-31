import { Request, Response, NextFunction } from "express";
import { getEligibleEqubers, getEligibleEqubersForMobile, getEligibleEqubersForMobileWithRequest } from "../controllers/admin/equb/helper/get-eligible-equbers.helper";
import prisma from "../config/db.config";
import AppError from "../shared/errors/app.error";


export const fetchEqubLotteryData = async (equbId: string) => {
  const equb = await prisma.equb.findUnique({
    where: {
      id: equbId,
    },
    include: {
      equbCategory: true,
    },
  });

  if (!equb) {
    return (
      new AppError(`Equb with ID ${equbId} does not exist`, 400)
    );
  }

  console.log("equb.hasLastRoundWinner", equb.hasLastRoundWinner);
  if (equb.hasLastRoundWinner) {
    const equbMembers = await prisma.equber.findMany({
      where: {
        equbId: equbId,
      },
      include: {
        users: {
          include: { user: true },
        },
        lotteryRequest: true,
      },
    });

    console.log(
      "equbMembers",
      equbMembers.map((lotteryNum) => lotteryNum.lotteryNumber)
    );
    const equbIsSpecial = equb.equbCategory.needsRequest;
    let eligibleMembers: any[] = [];
    if (equbIsSpecial) {
      console.log("Special Equb");
      console.log(equb.nextRoundLotteryType);
      eligibleMembers =
        equb.nextRoundLotteryType === "request"
          ? await getEligibleEqubersForMobile(
              equbMembers,
              equb.previousRound,
              equb.equbAmount
            )
          : await getEligibleEqubersForMobileWithRequest(
              equbMembers,
              equb.previousRound,
              equb.equbAmount
            );
    } else {
      console.log("Financial Equb");
      console.log("equb.previousRound from user/equb", equb.previousRound);
      eligibleMembers = await getEligibleEqubersForMobile(
        equbMembers,
        equb.previousRound,
        equb.equbAmount
      );
    }
    console.log("eligibleMembers length", eligibleMembers.length);

    const equbEligibleMembers = await getEligibleEqubers(
      equbMembers,
      equb.previousRound,
      equb.equbAmount
    );
    const currentRoundWinners = await prisma.equber.findMany({
      where: {
        equbId: equbId,
        winRound: equb.previousRound,
      },
      include: {
        users: {
          include: { user: true },
        },
      },
    });
       // Use WebSocketService to emit eligible members to a specific room
    //    WebSocketService.getInstance().publish(EventNames.EQUB_ElIGIBLE, {
    //     eligibleMembers,
    //     currentRoundWinners,
    //     equbEligibleMembers,
    //    }, req.params.id); 

    return {
        eligibleMembers,
        currentRoundWinners,
        equbEligibleMembers
      }}
    
   else {
    return { eligibleMembers: [],
      currentRoundWinners: [],
      equbEligibleMembers: []}
  }
}

export const getEqubLottery = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await fetchEqubLotteryData(req.params.id);
    return res.status(200).json({
      status: "success",
      data,
    });
  } catch (error: any) {
    next(error);
  }
};
