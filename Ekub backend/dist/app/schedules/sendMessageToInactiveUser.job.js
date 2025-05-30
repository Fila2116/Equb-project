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
const node_schedule_1 = __importDefault(require("node-schedule"));
const db_config_1 = __importDefault(require("../config/db.config"));
const sms_service_1 = __importDefault(require("../shared/sms/services/sms.service"));
// === Weekly job: Send message to inactive users ===
function sendMessageToInactiveUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("Sending message to inactive users...");
            const inactiveUsers = yield db_config_1.default.inActiveUser.findMany();
            for (const user of inactiveUsers) {
                if (user.phoneNumber) {
                    yield sms_service_1.default.sendReminderMessage(user.phoneNumber);
                }
                else {
                    console.warn(`User with ID ${user.id} has no phone number.`);
                }
            }
            console.log(" Messages sent to all inactive users.");
        }
        catch (error) {
            console.error(" Error sending messages to inactive users:", error);
        }
    });
}
// Schedule the job to run every Sunday at 9:00 AM
node_schedule_1.default.scheduleJob("0 9 * * 0", sendMessageToInactiveUsers);
// Run every minute
// schedule.scheduleJob("* * * * *", sendMessageToInactiveUsers);
