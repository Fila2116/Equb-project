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
function notifyBeforeLottery() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        console.log("I am here to notifyBeforeLottery");
        try {
            const now = new Date();
            const upcomingEqubs = yield db_config_1.default.equb.findMany({
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
                const timeLeftInMinutes = Math.floor((new Date(equb.nextRoundDate).getTime() - now.getTime()) / (1000 * 60));
                console.log("equb name", equb.name);
                console.log(" notify before lottery remaining time", timeLeftInMinutes);
                if ([30, 10, 5].includes(timeLeftInMinutes)) {
                    const message = `The ${equb.name} Equb draw is in ${timeLeftInMinutes} minutes. Please be ready!`;
                    const equberLength = equb.equbers.length;
                    const equbRequest = equb.equbCategory.needsRequest;
                    for (const equber of equb.equbers) {
                        for (const user of equber.users) {
                            const tokens = (_a = user.user.deviceTokens) === null || _a === void 0 ? void 0 : _a.map((token) => token.token);
                            const nextRound = new Date(equb.nextRoundDate);
                            const isoString = nextRound.toISOString();
                            if (tokens === null || tokens === void 0 ? void 0 : tokens.length) {
                                yield notification_service_1.PushNotification.getInstance().sendNotification(`Hello ${user.user.fullName}`, message, tokens, {
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
                                });
                            }
                            console.log("notification sent from notifyBeforeLottery");
                        }
                    }
                }
            }
        }
        catch (error) {
            console.error("Error in notifying before lottery:", error);
        }
    });
}
// schedule.scheduleJob("* * * * *", notifyBeforeLottery);
// export default notifyBeforeLottery;
const job = node_schedule_1.default.scheduleJob("* * * * *", notifyBeforeLottery);
module.exports = job;
