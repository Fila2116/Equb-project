import { Equber } from "@prisma/client";
import { PopulatedEquber } from "../../../user/equb/helper/payment.helper";
import prisma from "../../../../config/db.config";

export const getEligibleEqubers = async (
  equbers: Equber[],
  round: number,
  equbAmount: number
) => {
  console.log("finance equbers");
  console.log(equbers.map((eq) => eq.lotteryNumber));

  // return equbers.filter(equber=> equber.hasWonEqub===false)
  const expectedPaidAmount = round * equbAmount;
  console.log(`round: ${round}`);
  console.log(`equbAmount: ${equbAmount}`);

  console.log(`expectedPaidAmount: ${expectedPaidAmount}`);

  return equbers.filter((equber) => {
    console.log(
      `${equber.lotteryNumber} paid ${equber.totalPaid} / ${expectedPaidAmount}`
    );

    // console.log(`${equber.lotteryNumber} - ${equber.hasWonEqub}`);
    // console.log(`${equber.lotteryNumber} - ${equber.excluded}`);
    // console.log(`${equber.lotteryNumber} - ${equber.included}`);

    if (equber.hasWonEqub) return false;
    console.log(`${equber.lotteryNumber} - ${equber.excluded}`);
    if (equber.excluded) return false;
    console.log("exclude");
    if (equber.included) return true;
    console.log("include");

    if (equber.totalPaid >= expectedPaidAmount) {
      return true;
    } else {
      return false;
    }
  });
};

export const getEligibleEqubersForMobile = async (
  equbers: Equber[],
  round: number,
  equbAmount: number
) => {
  const expectedPaidAmount = round * equbAmount;
  console.log("equbers from mobile", equbers);

  return equbers.filter((equber) => {
    console.log(
      `${equber.lotteryNumber} paid ${equber.totalPaid} / ${expectedPaidAmount}`
    );
    console.log(`${equber.lotteryNumber} - ${equber.hasWonEqub}`);
    console.log(`${equber.lotteryNumber} - ${equber.excluded}`);
    console.log(`${equber.lotteryNumber} - ${equber.included}`);
    if (equber.hasWonEqub) return false;
    console.log("hasWonEqub");
    if (equber.excluded) return false;
    console.log("exclude");
    if (equber.included) return true;
    console.log("include");
    if (equber.totalPaid >= expectedPaidAmount) {
      return true;
    } else {
      return false;
    }
  });
};
export const getEligibleEqubersForMobileWithRequest = async (
  equbers: any,
  round: number,
  equbAmount?: number
) => {
  const Requbers = equbers as unknown as PopulatedEquber[];
  const equbersWhoHaveNotWon = Requbers.filter(
    (equber) => equber.hasWonEqub === false || equber.winRound == round - 1
  );
  const eligibleEqubers = equbersWhoHaveNotWon.filter(
    (equber) => equber.lotteryRequest
  );
  if (eligibleEqubers.length > 0) {
    return eligibleEqubers;
  } else {
    return equbersWhoHaveNotWon;
  }
  // const expectedPaidAmount = round*equbAmount;

  // return equbers.filter(equber=>{
  //     if(equber.excluded) return false;
  //     if(equber.hasWonEqub===true || equber.winRound==round-1) return false;
  //     if(equber.show) return true;
  //     // if(equber.totalPaid>= expectedPaidAmount){
  //     //     return true
  //     // }else{
  //     //     return false
  //     // }
  // })
};
export const getEligibleEqubersForRequest = async (
  equbId: string
): Promise<Equber[]> => {
  const equb = await prisma.equb.findUnique({
    where: { id: equbId },
    include: {
      equbers: {
        include: {
          lotteryRequest: true,
          users: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });
  if (!equb) return [];
  const { equbers, currentRound, equbAmount } = equb;
  const round = currentRound;
  console.log("requested equbers");
  console.log(equbers);

  const equbersWhoHaveNotWon = equbers.filter(
    (equber) => !equber.hasWonEqub && !equber.excluded && equber.show
  );

  // const equbersWhoHaveNotWon = equbers.filter(
  //   (equber) => !equber.hasWonEqub && !equber.excluded && equber.show && equber.included
  // );
  console.log("equbersWhoHaveNotWon equbers");
  console.log(equbersWhoHaveNotWon);
  const eligibleEqubers = equbersWhoHaveNotWon.filter(
    (equber) => equber.lotteryRequest
  );
  console.log("eligibleEqubers requeste....");
  console.log(eligibleEqubers);
  if (eligibleEqubers.length > 0) {
    return eligibleEqubers;
  } else {
    return equbersWhoHaveNotWon;
  }
};
