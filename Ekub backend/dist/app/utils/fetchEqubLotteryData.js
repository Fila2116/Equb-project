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
exports.getEqubLottery = exports.fetchEqubLotteryData = void 0;
const get_eligible_equbers_helper_1 = require("../controllers/admin/equb/helper/get-eligible-equbers.helper");
const db_config_1 = __importDefault(require("../config/db.config"));
const app_error_1 = __importDefault(require("../shared/errors/app.error"));
const fetchEqubLotteryData = (equbId) => __awaiter(void 0, void 0, void 0, function* () {
    const equb = yield db_config_1.default.equb.findUnique({
        where: {
            id: equbId,
        },
        include: {
            equbCategory: true,
        },
    });
    if (!equb) {
        return (new app_error_1.default(`Equb with ID ${equbId} does not exist`, 400));
    }
    console.log("equb.hasLastRoundWinner", equb.hasLastRoundWinner);
    if (equb.hasLastRoundWinner) {
        const equbMembers = yield db_config_1.default.equber.findMany({
            where: {
                equbId: equbId,
            },
            include: {
                users: {
                    include: { user: true },
                },
                lotteryRequest: true,
            },
        });
        console.log("equbMembers", equbMembers.map((lotteryNum) => lotteryNum.lotteryNumber));
        const equbIsSpecial = equb.equbCategory.needsRequest;
        let eligibleMembers = [];
        if (equbIsSpecial) {
            console.log("Special Equb");
            console.log(equb.nextRoundLotteryType);
            eligibleMembers =
                equb.nextRoundLotteryType === "request"
                    ? yield (0, get_eligible_equbers_helper_1.getEligibleEqubersForMobile)(equbMembers, equb.previousRound, equb.equbAmount)
                    : yield (0, get_eligible_equbers_helper_1.getEligibleEqubersForMobileWithRequest)(equbMembers, equb.previousRound, equb.equbAmount);
        }
        else {
            console.log("Financial Equb");
            console.log("equb.previousRound from user/equb", equb.previousRound);
            eligibleMembers = yield (0, get_eligible_equbers_helper_1.getEligibleEqubersForMobile)(equbMembers, equb.previousRound, equb.equbAmount);
        }
        console.log("eligibleMembers length", eligibleMembers.length);
        const equbEligibleMembers = yield (0, get_eligible_equbers_helper_1.getEligibleEqubers)(equbMembers, equb.previousRound, equb.equbAmount);
        const currentRoundWinners = yield db_config_1.default.equber.findMany({
            where: {
                equbId: equbId,
                winRound: equb.previousRound,
            },
            include: {
                users: {
                    include: { user: true },
                },
            },
        });
        // Use WebSocketService to emit eligible members to a specific room
        //    WebSocketService.getInstance().publish(EventNames.EQUB_ElIGIBLE, {
        //     eligibleMembers,
        //     currentRoundWinners,
        //     equbEligibleMembers,
        //    }, req.params.id); 
        return {
            eligibleMembers,
            currentRoundWinners,
            equbEligibleMembers
        };
    }
    else {
        return { eligibleMembers: [],
            currentRoundWinners: [],
            equbEligibleMembers: [] };
    }
});
exports.fetchEqubLotteryData = fetchEqubLotteryData;
const getEqubLottery = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, exports.fetchEqubLotteryData)(req.params.id);
        return res.status(200).json({
            status: "success",
            data,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getEqubLottery = getEqubLottery;
