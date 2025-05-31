import schedule from "node-schedule";
import prisma from "../config/db.config";
import { PushNotification } from "../shared/notification/services/notification.service";
import { IPayload } from "../shared/notification/interfaces/payload.interface";

async function notifyBeforeLottery() {
  console.log("I am here to notifyBeforeLottery");
  try {
    const now = new Date();

    const upcomingEqubs = await prisma.equb.findMany({
      where: { nextRoundDate: { gte: now } },
      include: {
        equbers: {
          include: {
            users: {
              include: {
                user: { include: { deviceTokens: true } },
              },
            },
          },
        },
        equbCategory: true,
      },
    });

    for (const equb of upcomingEqubs) {
      const timeLeftInMinutes = Math.floor(
        (new Date(equb.nextRoundDate!).getTime() - now.getTime()) / (1000 * 60)
      );
      console.log("equb name", equb.name);
      console.log(" notify before lottery remaining time", timeLeftInMinutes);
      if ([30, 10, 5].includes(timeLeftInMinutes)) {
        const message = `The ${equb.name} Equb draw is in ${timeLeftInMinutes} minutes. Please be ready!`;

        const equberLength = equb.equbers.length;
        const equbRequest = equb.equbCategory.needsRequest;

        for (const equber of equb.equbers) {
          for (const user of equber.users) {
            const tokens = user.user.deviceTokens?.map((token) => token.token);
            const nextRound = new Date(equb.nextRoundDate!);
            const isoString = nextRound.toISOString();
            if (tokens?.length) {
              await PushNotification.getInstance().sendNotification(
                `Hello ${user.user.fullName}`,
                message,
                tokens,
                {
                  type: "Equb Draw",
                  equbName: equb.name.toString(),
                  equbId: equb.id.toString(),
                  equbServiceCharge: equb.serviceCharge.toString(),
                  equbAmount: equb.equbAmount.toString(),
                  nextRoundTime: equb.nextRoundTime.toString(),
                  nextRoundDate: isoString,
                  nextRoundLotteryType: equb.nextRoundLotteryType.toString(),
                  numberOfEqubers: equb.numberOfEqubers.toString(),
                  equbRequest: equbRequest.toString(),
                  equberLength: equberLength.toString(),
                } as unknown as IPayload
              );
            }
            console.log("notification sent from notifyBeforeLottery");
          }
        }
      }
    }
  } catch (error) {
    console.error("Error in notifying before lottery:", error);
  }
}

// schedule.scheduleJob("* * * * *", notifyBeforeLottery);
// export default notifyBeforeLottery;
const job = schedule.scheduleJob("* * * * *", notifyBeforeLottery);

module.exports = job;
