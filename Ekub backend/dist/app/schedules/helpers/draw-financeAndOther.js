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
exports.drawFinanceAndOther = void 0;
const db_config_1 = __importDefault(require("../../config/db.config"));
const get_eligible_equbers_helper_1 = require("../../controllers/admin/equb/helper/get-eligible-equbers.helper");
const draw_lottery_job_1 = require("../draw-lottery.job");
const drawFinanceAndOther = (equbId) => __awaiter(void 0, void 0, void 0, function* () {
    const equb = yield db_config_1.default.equb.findUnique({
        where: { id: equbId },
        include: {
            equbType: true,
            equbCategory: true,
            equbers: {
                include: {
                    users: { include: { user: true } },
                },
            },
        },
    });
    if (!equb) {
        console.log(`Equb with ID ${equbId} not found.`);
        return null;
    }
    const { currentRound, nextRoundLotteryType, equbType, equbers, nextRoundDate } = equb;
    console.log("Equb exists:", equb.name);
    console.log("Current Round:", currentRound);
    console.log("Next Round Type:", nextRoundLotteryType);
    // Fetch the current status of the Equb to avoid overwrites
    const currentEqub = yield db_config_1.default.equb.findUnique({
        where: { id: equbId },
        select: { status: true },
    });
    if ((currentEqub === null || currentEqub === void 0 ? void 0 : currentEqub.status) === "completed") {
        console.log(`Equb ${equbId} is already completed. Skipping.`);
        return;
    }
    if (nextRoundLotteryType === "finance") {
        const eligibleEqubers = yield (0, get_eligible_equbers_helper_1.getEligibleEqubers)(equbers, currentRound, equb.equbAmount);
        console.log("Eligible Equbers:", eligibleEqubers);
        if (eligibleEqubers.length > 0) {
            const winners = yield (0, draw_lottery_job_1.selectRandomWinners)(eligibleEqubers, equb.currentRoundWinners);
            console.log("Winners:", winners);
            if (winners.length > 0) {
                // Update each winner
                for (const winner of winners) {
                    yield db_config_1.default.equber.update({
                        where: { id: winner.id },
                        data: {
                            winRound: currentRound,
                            hasWonEqub: true,
                        },
                    });
                }
                const totalEqubers = yield db_config_1.default.equber.count({ where: { equbId } });
                const totalWonEqubers = yield db_config_1.default.equber.count({
                    where: { equbId, hasWonEqub: true },
                });
                const updatedData = totalEqubers === totalWonEqubers
                    ? { status: "completed" }
                    : {
                        nextRoundDate: calculateNextRoundDate(nextRoundDate, equbType.interval),
                        nextRoundLotteryType: "other",
                        status: "started",
                    };
                updatedData.currentRound = { increment: winners.length };
                updatedData.previousRound = currentRound;
                updatedData.hasLastRoundWinner = true;
                const updatedEqub = yield db_config_1.default.equb.update({
                    where: { id: equbId },
                    data: updatedData,
                });
                console.log("Equb Updated:", updatedEqub);
            }
            else {
                console.log(`No winners for Equb ${equb.name}`);
            }
        }
        else {
            console.log(`No eligible users for finance round in ${equb.name}`);
            yield handleNoEligibleUsers(equb, equbType.interval);
        }
    }
    else if (nextRoundLotteryType === "other") {
        const eligibleEqubers = yield (0, get_eligible_equbers_helper_1.getEligibleEqubersForRequest)(equbId);
        console.log("Eligible Equbers for Other:", eligibleEqubers);
        if (eligibleEqubers.length > 0) {
            const winners = yield (0, draw_lottery_job_1.selectRandomWinners)(eligibleEqubers, equb.currentRoundWinners);
            console.log("Winners for Other:", winners);
            if (winners.length > 0) {
                // Update each winner
                for (const winner of winners) {
                    yield db_config_1.default.equber.update({
                        where: { id: winner.id },
                        data: {
                            winRound: currentRound,
                            hasWonEqub: true,
                        },
                    });
                }
                const totalEqubers = yield db_config_1.default.equber.count({ where: { equbId } });
                const totalWonEqubers = yield db_config_1.default.equber.count({
                    where: { equbId, hasWonEqub: true },
                });
                const updatedData = totalEqubers === totalWonEqubers
                    ? { status: "completed" }
                    : {
                        nextRoundDate: calculateNextRoundDate(nextRoundDate, equbType.interval),
                        nextRoundLotteryType: "finance",
                        status: "started",
                    };
                updatedData.currentRound = { increment: winners.length };
                updatedData.previousRound = currentRound;
                updatedData.hasLastRoundWinner = true;
                const updatedEqub = yield db_config_1.default.equb.update({
                    where: { id: equbId },
                    data: updatedData,
                });
                console.log("Equb Updated (Other):", updatedEqub);
            }
            else {
                console.log(`No winners for other round in ${equb.name}`);
            }
        }
        else {
            console.log(`No eligible users for other round in ${equb.name}`);
            yield handleNoEligibleUsers(equb, equbType.interval);
        }
    }
});
exports.drawFinanceAndOther = drawFinanceAndOther;
const calculateNextRoundDate = (currentDate, interval) => {
    const nextDate = new Date(currentDate || Date.now());
    nextDate.setDate(nextDate.getDate() + interval);
    return nextDate;
};
const handleNoEligibleUsers = (equb, interval) => __awaiter(void 0, void 0, void 0, function* () {
    const nextRoundDate = calculateNextRoundDate(equb.nextRoundDate, interval);
    yield db_config_1.default.equb.update({
        where: { id: equb.id },
        data: {
            nextRoundDate,
            status: "started",
            hasLastRoundWinner: false,
        },
    });
    console.log(`Updated Equb ${equb.name} with no eligible users.`);
});
