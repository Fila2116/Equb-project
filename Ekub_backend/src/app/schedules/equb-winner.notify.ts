import schedule from "node-schedule";
import prisma from "../config/db.config";
import { getEligibleEqubers } from "../controllers/admin/equb/helper/get-eligible-equbers.helper";
import SMSService from "../shared/sms/services/sms.service";
import { PushNotification } from "../shared/notification/services/notification.service";

// Function to be executed by the scheduler
async function notifyEqubWinner() {
  try {
    console.log("Fetching equb winners with in a  minute...");
    const now = new Date();
    // const dueDateTime = new Date(now.getTime() +1*  60 * 1000);
    const notNotifiedEqubWinners = await prisma.equber.findMany({
      where: {
        hasWonEqub: true,
        updatedAt: {
          lt: now,
        },
        isNotified: false,
      },
      include: {
        users: {
          include: {
            user: {
              include: { deviceTokens: true },
            },
          },
        },
        equb: true,
      },
    });

    for (const equber of notNotifiedEqubWinners) {
      for (const equberUser of equber.users) {
        console.log("equberUser.user.phoneNumber");
        console.log(equberUser.user.phoneNumber);

        // await SMSService.sendSms(equberUser.user.phoneNumber!,`Congratulations, You have won ${equber.equb?.name}'s Round ${equber.equb?.currentRound! -1}. You can claim on the app.  `);

        const tokens = equberUser.user?.deviceTokens.map(
          (token) => token.token
        );
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
            body: `Congratulations, You have won ${equber.equb?.name}. You can claim on the app.`,
            userId: `${equberUser.userId}`,
          },
        });

        await prisma.equber.update({
          where: { id: equber.id },
          data: {
            isNotified: true,
          },
        });
      }
    }
  } catch (error) {
    console.error("Error drawing lottery:", error);
  }
}

// Schedule a task to run every minute
const job = schedule.scheduleJob("* * * * *", notifyEqubWinner);

module.exports = job;
