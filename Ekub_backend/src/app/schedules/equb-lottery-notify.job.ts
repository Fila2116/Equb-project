import schedule from "node-schedule";
import prisma from "../config/db.config";
import {
  getEligibleEqubers,
  getEligibleEqubersForMobile,
} from "../controllers/admin/equb/helper/get-eligible-equbers.helper";
import { PopulatedEquber } from "../controllers/user/equb/helper/payment.helper";
import SMSService from "../shared/sms/services/sms.service";
import { PushNotification } from "../shared/notification/services/notification.service";

// Function to be executed by the scheduler
async function notifyEqubers() {
  try {
    console.log("Fetching Upcoming equbs...");
    const notificatioinSetting = await prisma.setting.findFirst({
      where: { name: "notificationTime" },
    });
    const notificationTime = notificatioinSetting?.numericValue || 5;
    const now = new Date();
    const aMinuteFromNow = new Date(
      now.getTime() + notificationTime * 60 * 1000
    );
    const pastEqubs = await prisma.equb.findMany({
      where: {
        nextRoundDate: {
          lt: aMinuteFromNow,
        },
      },
      include: {
        equbType: true,
        equbers: {
          include: {
            users: {
              include: { user: { include: { deviceTokens: true } } },
            },
          },
        },
      },
    });
    // console.log('pastEqubs')
    // console.log(pastEqubs)
    for (const equb of pastEqubs) {
      const eligibleEqubers = getEligibleEqubersForMobile(
        equb.equbers,
        equb.currentRound,
        equb.equbAmount
      ) as unknown as PopulatedEquber[];
      if (eligibleEqubers.length > 0) {
        for (const equber of eligibleEqubers) {
          for (const user of equber.users) {
            await SMSService.sendSms(
              user.user.phoneNumber!,
              `${equb.name} will be draw in a few.`
            );
            const tokens = user?.user.deviceTokens.map((token) => token.token);
            console.log("tokens");
            console.log(tokens);
            // @ts-ignore
            PushNotification.getInstance().sendNotification(
              "Hagerigna Equb",
              `Congratulations, You have won ${equber.equb?.name}. You can claim on the app.  `,
              tokens
            );
            await prisma.notification.create({
              data: {
                title: "Hagerigna Equb",
                body: `Congratulations, You have won ${equber.equb?.name}. You can claim on the app. `,
                userId: `${user.userId}`,
              },
            });
          }
        }
      } else {
        console.log(`No eligible users to send sms`);
      }
    }
  } catch (error) {
    console.error("Error drawing lottery:", error);
  }
}

// Schedule a task to run every minute
const job = schedule.scheduleJob("* * * * *", notifyEqubers);

module.exports = job;
