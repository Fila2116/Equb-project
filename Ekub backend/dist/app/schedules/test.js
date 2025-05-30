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
const db_config_1 = __importDefault(require("../config/db.config"));
// Function to be executed by the scheduler
function drawLottery() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('Fetching Upcoming equbs...');
            const now = new Date();
            const aMinuteFromNow = new Date(now.getTime() + 1 * 60 * 1000);
            const pastEqubs = yield db_config_1.default.equb.findMany({
                where: {
                    nextRoundDate: {
                        lt: aMinuteFromNow,
                    },
                },
                include: {
                    equbType: true,
                    equbers: {
                        include: { users: {
                                include: { user: true }
                            } }
                    }
                }
            });
            // console.log('pastEqubs')
            // console.log(pastEqubs)
            if (pastEqubs.length > 0) {
                for (const equb of pastEqubs) {
                    const now = new Date();
                    const aMinuteAgo = new Date(now.getTime() + 60 * 1000);
                    if (equb.nextRoundDate < aMinuteAgo) {
                        console.log(`Yederese equb for ${equb.name} `);
                        console.log(`Date : ${equb.nextRoundDate} `);
                    }
                }
            }
            else {
                console.log('Yederese equb yelem');
            }
        }
        catch (error) {
            console.error('Error drawing lottery:', error);
        }
    });
}
drawLottery();
