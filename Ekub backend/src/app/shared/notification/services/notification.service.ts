import admin from "firebase-admin";
import serviceAccount from "../configs/service-account.json";
import { IPayload } from "../interfaces/payload.interface";
import { getChunks } from "../../../utils/get-chunks.util";

export class PushNotification {
  private static instance: PushNotification;

  private constructor() {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      projectId: "hagerigna-equb-31235",
    });
  }

  public static getInstance(): PushNotification {
    if (!PushNotification.instance) {
      PushNotification.instance = new PushNotification();
    }
    return PushNotification.instance;
  }

  public async sendNotification(
    title: string,
    body: string,
    tokens: string[],
    data: IPayload
  ) {
    try {
      // Remove duplicate tokens
      const uniqueTokens = [...new Set(tokens)];

      // Split tokens into chunks of 400
      const chunks = getChunks(uniqueTokens, 400);

      // Loop through each chunk of tokens and send notifications
      for (const chunk of chunks) {
        console.log("Sending to tokens:", chunk);

        // Send the notification to the chunk
        const response = await admin.messaging().sendEachForMulticast({
          notification: {
            title,
            body,
          },
          tokens: chunk,
          data: data as any,
        });

        const invalidTokens: string[] = [];

        // Log the response and check for errors
        console.log("Response:", response);

        // Check each response and log invalid tokens
        response.responses.forEach((result, index) => {
          if (result.error) {
            console.error(
              `Error sending notification to ${chunk[index]}: ${result.error.message}`
            );
            if (
              result.error.code === "messaging/invalid-registration-token" ||
              result.error.code ===
                "messaging/registration-token-not-registered"
            ) {
              invalidTokens.push(chunk[index]);
            }
          }
        });

        // Log invalid tokens if any
        if (invalidTokens.length > 0) {
          console.log("Invalid tokens:", invalidTokens);
        }
      }

      console.log("Notifications sent successfully.");
    } catch (err) {
      console.error("Error sending notifications:", err);
    }
  }

  public async sendSingleNotification(
    title: string,
    body: string,
    token: string,
    data: IPayload
  ) {
    try {
      console.log("Sending notification to token:", token);

      // Send the notification to a single token
      const response = await admin.messaging().send({
        notification: {
          title,
          body,
        },
        token,
        data: data as any,
      });

      console.log("Response:", response);
    } catch (err) {
      console.error("Error sending single notification:", err);
    }
  }
}
