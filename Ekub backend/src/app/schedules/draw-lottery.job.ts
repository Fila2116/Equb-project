import schedule from "node-schedule";
import prisma from "../config/db.config";
import { getDateInNairobiTimezone } from "../shared/helpers/date.helper";
import { drawSpecialEqub } from "./helpers/draw-special-equb";
import { drawFinancialEqub } from "./helpers/draw-financial-equb";
import { drawFinanceAndOther } from "./helpers/draw-financeAndOther";
import { resetFinancePoint } from "../utils/updateFinancialPoint";

// Function to be executed by the scheduler
async function drawLottery() {
  try {
    console.log("Fetching Upcoming equbs ...");

    const now = new Date();
    console.log("Date...",now);
    const aMinuteFromNow = new Date(now.getTime() + 1 * 60 * 1000);
    console.log("aMinuteFromNow");
    console.log(aMinuteFromNow);
    // const timeNow = (await axios.get('https://timeapi.io/api/time/current/zone?timeZone=Africa%2FAddis_Ababa')).data;
    // console.log('timeNow');
    // console.log(timeNow);

    const aMinuteFromNowInEth = getDateInNairobiTimezone(aMinuteFromNow);
    console.log("aMinuteFromNowInEth");
    console.log(aMinuteFromNowInEth);
    const pastEqubs = await prisma.equb.findMany({
      where: {
        nextRoundDate: {
          lte: aMinuteFromNowInEth,
        },
      },
      include: {
        equbType: true,
        joinedUsers: true,
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
    if (pastEqubs.length > 0) {
      for (const equb of pastEqubs) {
        console.log(`drawing for equb`, equb);
        const equbIsSpecial = equb.equbCategory.needsRequest;
        const Travel = equb.equbCategory.isSaving;

        if (Travel) return null;
        if (equb.nextRoundDate === null) return null;

        if (equbIsSpecial) {
          console.log("Special Equb");
          drawSpecialEqub(equb.id);
        } else {
          console.log("Financial Equb");
          drawFinancialEqub(equb.id);
        }
      }
    } else {
      console.log("No past equb for this minute");
    }
  } catch (error) {
    console.error("Error drawing lottery:", error);
  }
}

// Function to select a random winner
export const selectRandomWinners = async (
  equbers: any[],
  numberOfWinners: number
) => {
  if (equbers.length === 0) {
    return [];
  }

  // Shuffle equbers to randomize selection
  const shuffled = equbers.sort(() => 0.5 - Math.random());

  console.log(`numberOfWinners on random winner selector`, numberOfWinners);
  // Select the top numberOfWinners from the shuffled list
  const winners = shuffled.slice(0, numberOfWinners);
  console.log(`winners on random winner selector`, winners);

  return winners;
};

// Schedule a task to run every minute
const job = schedule.scheduleJob("* * * * *", drawLottery);

// module.exports = job;
drawLottery();