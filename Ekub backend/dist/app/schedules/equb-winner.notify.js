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
const notification_service_1 = require("../shared/notification/services/notification.service");
// Function to be executed by the scheduler
function notifyEqubWinner() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            console.log("Fetching equb winners with in a  minute...");
            const now = new Date();
            // const dueDateTime = new Date(now.getTime() +1*  60 * 1000);
            const notNotifiedEqubWinners = yield db_config_1.default.equber.findMany({
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
                    const tokens = (_a = equberUser.user) === null || _a === void 0 ? void 0 : _a.deviceTokens.map((token) => token.token);
                    console.log("tokens");
                    console.log(tokens);
                    // @ts-ignore
                    notification_service_1.PushNotification.getInstance().sendNotification("Hagerigna Equb", `Congratulations, You have won ${(_b = equber.equb) === null || _b === void 0 ? void 0 : _b.name}. You can claim on the app.  `, tokens);
                    yield db_config_1.default.notification.create({
                        data: {
                            title: "Hagerigna Equb",
                            body: `Congratulations, You have won ${(_c = equber.equb) === null || _c === void 0 ? void 0 : _c.name}. You can claim on the app.`,
                            userId: `${equberUser.userId}`,
                        },
                    });
                    yield db_config_1.default.equber.update({
                        where: { id: equber.id },
                        data: {
                            isNotified: true,
                        },
                    });
                }
            }
        }
        catch (error) {
            console.error("Error drawing lottery:", error);
        }
    });
}
// Schedule a task to run every minute
const job = node_schedule_1.default.scheduleJob("* * * * *", notifyEqubWinner);
module.exports = job;
