import axios from "axios";
import { cleanEnv, str } from "envalid";
import AppError from "../../errors/app.error";
const env = cleanEnv(process.env, {
  SENDER_ID: str(),
  MESSAGE_API_KEY: str(),
});

function sendOtp(to: string, prefix: string = "") {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(`to: ${to}`);
      // const {otp}= await generateOtp()
      // const text = OtpSms(otp,autofill);
      // await SMSService.sendSms(to,text);
      // resolve(otp);
      const baseUrl = "https://api.afromessage.com/api/challenge";
      const token = env.MESSAGE_API_KEY;

      const headers = {
        Authorization: `Bearer ${token}`,
      };
      const from = env.SENDER_ID;
      const sender = "HagrgnaEqub";

      const callback = "YOUR_TOKEN";
      const pre = prefix;
      const post = "";
      const sb = 1;
      const sa = 1;
      const ttl = 0;
      const len = 4;
      const t = 0;
      const url = `${baseUrl}?from=${from}&sender=${sender}&to=${to}&pr=${pre}&ps=${post}&callback=${callback}&sb=${sb}&sa=${sa}&ttl=${ttl}&len=${len}&t=${t}`;

      const response = await axios.get(url, { headers });

      resolve(response);
    } catch (err) {
      console.log("err on sendOtp function");
      console.log(err);
      reject(new AppError("Something wrong sending otp", 500));
    }
  });
}

async function sendReminderMessage(to: string) {
  return new Promise(async (resolve, reject) => {
    try {
      const message = `Hello! You recently began registering with Hagerigna Cloud Equb but haven't completed the process.\n\nWe invite you to finish your registration on the Hagerigna application and start your journey with a smarter, more secure way to save and grow in trusted Equb circles.\n\nThank you for choosing Hagerigna — where tradition meets technology.`;
      const baseUrl = "https://api.afromessage.com/api/send";
      const token = env.MESSAGE_API_KEY;

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const payload = {
        to,
        message,
        sender: "HagrgnaEqub",
        from: env.SENDER_ID,
      };

      const response = await axios.post(baseUrl, payload, { headers });

      resolve(response.data);
    } catch (err) {
      console.error("Error sending reminder SMS:", err);
      reject(new AppError("Failed to send reminder message", 500));
    }
  });
}

function sendSms(to: string, text: string) {
  return new Promise(async (resolve, reject) => {
    try {
      let message = text;

      const options = {
        url: "https://api.afromessage.com/api/send",
        method: "POST",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${env.MESSAGE_API_KEY}`,
        },
        body: {
          from: env.SENDER_ID,
          sender: "HagrgnaEqub",
          to,
          message: message,
          callback: "https://api.afromessage.com/api/challenge",
        },
      };

      const response = await axios.post(options.url, options.body, {
        headers: options.headers,
      });
      console.log("response.data");
      console.log(response.data);
      resolve(response.data);
    } catch (err) {
      console.log("err on sendSms function");
      console.log(err);
      reject(new AppError("Something wrong sending the sms", 500));
    }
  });
}

async function sendBulkSms(phoneNumber: string[], message: string) {
  try {
    const url = "https://api.afromessage.com/api/bulk_send";
    const token = env.MESSAGE_API_KEY;
    const from = env.SENDER_ID;
    const sender = "HagrgnaEqub";
    if (!token || !from || !sender) {
      throw new Error("Missing required environment variables");
    }
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    const data = {
      to: phoneNumber,
      message,
      from,
      sender,
    };
    console.log("Sending Bulk SMS:", data);

    const response = await axios.post(url, data, { headers });

    console.log("Bulk SMS Response:", response.data);

    return response.data;
  } catch (err: any) {
    console.error("Error in sendBulkSms:", err.response?.data || err.message);
    throw new AppError("Something went wrong while sending bulk SMS", 500);
  }
}

const SMSService = {
  sendOtp,
  sendSms,
  sendBulkSms,
  sendReminderMessage
};
export default SMSService;
