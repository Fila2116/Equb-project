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
exports.selectRandomWinners = void 0;
const node_schedule_1 = __importDefault(require("node-schedule"));
const db_config_1 = __importDefault(require("../config/db.config"));
const date_helper_1 = require("../shared/helpers/date.helper");
const draw_special_equb_1 = require("./helpers/draw-special-equb");
const draw_financial_equb_1 = require("./helpers/draw-financial-equb");
// Function to be executed by the scheduler
function drawLottery() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("Fetching Upcoming equbs ...");
            const now = new Date();
            console.log("Date...", now);
            const aMinuteFromNow = new Date(now.getTime() + 1 * 60 * 1000);
            console.log("aMinuteFromNow");
            console.log(aMinuteFromNow);
            // const timeNow = (await axios.get('https://timeapi.io/api/time/current/zone?timeZone=Africa%2FAddis_Ababa')).data;
            // console.log('timeNow');
            // console.log(timeNow);
            const aMinuteFromNowInEth = (0, date_helper_1.getDateInNairobiTimezone)(aMinuteFromNow);
            console.log("aMinuteFromNowInEth");
            console.log(aMinuteFromNowInEth);
            const pastEqubs = yield db_config_1.default.equb.findMany({
                where: {
                    nextRoundDate: {
                        lte: aMinuteFromNowInEth,
                    },
                },
                include: {
                    equbType: true,
                    joinedUsers: true,
                    equbCategory: true,
                    equbers: {
                        include: {
                            users: {
                                include: { user: true },
                            },
                        },
                    },
                },
            });
            if (pastEqubs.length > 0) {
                for (const equb of pastEqubs) {
                    console.log(`drawing for equb`, equb);
                    const equbIsSpecial = equb.equbCategory.needsRequest;
                    const Travel = equb.equbCategory.isSaving;
                    if (Travel)
                        return null;
                    if (equb.nextRoundDate === null)
                        return null;
                    if (equbIsSpecial) {
                        console.log("Special Equb");
                        (0, draw_special_equb_1.drawSpecialEqub)(equb.id);
                    }
                    else {
                        console.log("Financial Equb");
                        (0, draw_financial_equb_1.drawFinancialEqub)(equb.id);
                    }
                }
            }
            else {
                console.log("No past equb for this minute");
            }
        }
        catch (error) {
            console.error("Error drawing lottery:", error);
        }
    });
}
// Function to select a random winner
const selectRandomWinners = (equbers, numberOfWinners) => __awaiter(void 0, void 0, void 0, function* () {
    if (equbers.length === 0) {
        return [];
    }
    // Shuffle equbers to randomize selection
    const shuffled = equbers.sort(() => 0.5 - Math.random());
    console.log(`numberOfWinners on random winner selector`, numberOfWinners);
    // Select the top numberOfWinners from the shuffled list
    const winners = shuffled.slice(0, numberOfWinners);
    console.log(`winners on random winner selector`, winners);
    return winners;
});
exports.selectRandomWinners = selectRandomWinners;
// Schedule a task to run every minute
const job = node_schedule_1.default.scheduleJob("* * * * *", drawLottery);
// module.exports = job;
drawLottery();
