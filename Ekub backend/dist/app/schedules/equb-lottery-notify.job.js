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
const get_eligible_equbers_helper_1 = require("../controllers/admin/equb/helper/get-eligible-equbers.helper");
const sms_service_1 = __importDefault(require("../shared/sms/services/sms.service"));
const notification_service_1 = require("../shared/notification/services/notification.service");
// Function to be executed by the scheduler
function notifyEqubers() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            console.log("Fetching Upcoming equbs...");
            const notificatioinSetting = yield db_config_1.default.setting.findFirst({
                where: { name: "notificationTime" },
            });
            const notificationTime = (notificatioinSetting === null || notificatioinSetting === void 0 ? void 0 : notificatioinSetting.numericValue) || 5;
            const now = new Date();
            const aMinuteFromNow = new Date(now.getTime() + notificationTime * 60 * 1000);
            const pastEqubs = yield db_config_1.default.equb.findMany({
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
                const eligibleEqubers = (0, get_eligible_equbers_helper_1.getEligibleEqubersForMobile)(equb.equbers, equb.currentRound, equb.equbAmount);
                if (eligibleEqubers.length > 0) {
                    for (const equber of eligibleEqubers) {
                        for (const user of equber.users) {
                            yield sms_service_1.default.sendSms(user.user.phoneNumber, `${equb.name} will be draw in a few.`);
                            const tokens = user === null || user === void 0 ? void 0 : user.user.deviceTokens.map((token) => token.token);
                            console.log("tokens");
                            console.log(tokens);
                            // @ts-ignore
                            notification_service_1.PushNotification.getInstance().sendNotification("Hagerigna Equb", `Congratulations, You have won ${(_a = equber.equb) === null || _a === void 0 ? void 0 : _a.name}. You can claim on the app.  `, tokens);
                            yield db_config_1.default.notification.create({
                                data: {
                                    title: "Hagerigna Equb",
                                    body: `Congratulations, You have won ${(_b = equber.equb) === null || _b === void 0 ? void 0 : _b.name}. You can claim on the app. `,
                                    userId: `${user.userId}`,
                                },
                            });
                        }
                    }
                }
                else {
                    console.log(`No eligible users to send sms`);
                }
            }
        }
        catch (error) {
            console.error("Error drawing lottery:", error);
        }
    });
}
// Schedule a task to run every minute
const job = node_schedule_1.default.scheduleJob("* * * * *", notifyEqubers);
module.exports = job;
