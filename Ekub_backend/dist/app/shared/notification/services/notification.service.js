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
exports.PushNotification = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const service_account_json_1 = __importDefault(require("../configs/service-account.json"));
const get_chunks_util_1 = require("../../../utils/get-chunks.util");
class PushNotification {
    constructor() {
        firebase_admin_1.default.initializeApp({
            credential: firebase_admin_1.default.credential.cert(service_account_json_1.default),
            projectId: "hagerigna-equb-31235",
        });
    }
    static getInstance() {
        if (!PushNotification.instance) {
            PushNotification.instance = new PushNotification();
        }
        return PushNotification.instance;
    }
    sendNotification(title, body, tokens, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Remove duplicate tokens
                const uniqueTokens = [...new Set(tokens)];
                // Split tokens into chunks of 400
                const chunks = (0, get_chunks_util_1.getChunks)(uniqueTokens, 400);
                // Loop through each chunk of tokens and send notifications
                for (const chunk of chunks) {
                    console.log("Sending to tokens:", chunk);
                    // Send the notification to the chunk
                    const response = yield firebase_admin_1.default.messaging().sendEachForMulticast({
                        notification: {
                            title,
                            body,
                        },
                        tokens: chunk,
                        data: data,
                    });
                    const invalidTokens = [];
                    // Log the response and check for errors
                    console.log("Response:", response);
                    // Check each response and log invalid tokens
                    response.responses.forEach((result, index) => {
                        if (result.error) {
                            console.error(`Error sending notification to ${chunk[index]}: ${result.error.message}`);
                            if (result.error.code === "messaging/invalid-registration-token" ||
                                result.error.code ===
                                    "messaging/registration-token-not-registered") {
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
            }
            catch (err) {
                console.error("Error sending notifications:", err);
            }
        });
    }
    sendSingleNotification(title, body, token, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("Sending notification to token:", token);
                // Send the notification to a single token
                const response = yield firebase_admin_1.default.messaging().send({
                    notification: {
                        title,
                        body,
                    },
                    token,
                    data: data,
                });
                console.log("Response:", response);
            }
            catch (err) {
                console.error("Error sending single notification:", err);
            }
        });
    }
}
exports.PushNotification = PushNotification;
