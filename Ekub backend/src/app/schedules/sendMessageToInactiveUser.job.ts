import schedule from "node-schedule";
import prisma from "../config/db.config";
import SMSService from "../shared/sms/services/sms.service";
// === Weekly job: Send message to inactive users ===


async function sendMessageToInactiveUsers() {
  try {
    console.log("Sending message to inactive users...");

    const inactiveUsers = await prisma.inActiveUser.findMany();

    for (const user of inactiveUsers) {
        if (user.phoneNumber) {
          await SMSService.sendReminderMessage(user.phoneNumber);
        } else {
          console.warn(`User with ID ${user.id} has no phone number.`);
        }
    }

    console.log(" Messages sent to all inactive users.");
  } catch (error) {
    console.error(" Error sending messages to inactive users:", error);
  }
}

// Schedule the job to run every Sunday at 9:00 AM
schedule.scheduleJob("0 9 * * 0", sendMessageToInactiveUsers);

// Run every minute
// schedule.scheduleJob("* * * * *", sendMessageToInactiveUsers);
