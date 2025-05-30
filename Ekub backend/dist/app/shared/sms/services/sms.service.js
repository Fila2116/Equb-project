"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const envalid_1 = require("envalid");
const app_error_1 = __importDefault(require("../../errors/app.error"));
const env = (0, envalid_1.cleanEnv)(process.env, {
    SENDER_ID: (0, envalid_1.str)(),
    MESSAGE_API_KEY: (0, envalid_1.str)(),
});
function sendOtp(to, prefix = "") {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
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
            const response = yield axios_1.default.get(url, { headers });
            resolve(response);
        }
        catch (err) {
            console.log("err on sendOtp function");
            console.log(err);
            reject(new app_error_1.default("Something wrong sending otp", 500));
        }
    }));
}
function sendReminderMessage(to) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
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
                const response = yield axios_1.default.post(baseUrl, payload, { headers });
                resolve(response.data);
            }
            catch (err) {
                console.error("Error sending reminder SMS:", err);
                reject(new app_error_1.default("Failed to send reminder message", 500));
            }
        }));
    });
}
function sendSms(to, text) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
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
            const response = yield axios_1.default.post(options.url, options.body, {
                headers: options.headers,
            });
            console.log("response.data");
            console.log(response.data);
            resolve(response.data);
        }
        catch (err) {
            console.log("err on sendSms function");
            console.log(err);
            reject(new app_error_1.default("Something wrong sending the sms", 500));
        }
    }));
}
function sendBulkSms(phoneNumber, message) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
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
            const response = yield axios_1.default.post(url, data, { headers });
            console.log("Bulk SMS Response:", response.data);
            return response.data;
        }
        catch (err) {
            console.error("Error in sendBulkSms:", ((_a = err.response) === null || _a === void 0 ? void 0 : _a.data) || err.message);
            throw new app_error_1.default("Something went wrong while sending bulk SMS", 500);
        }
    });
}
const SMSService = {
    sendOtp,
    sendSms,
    sendBulkSms,
    sendReminderMessage
};
exports.default = SMSService;
