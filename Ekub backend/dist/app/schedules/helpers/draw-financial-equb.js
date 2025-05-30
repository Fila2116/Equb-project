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
exports.drawFinancialEqub = void 0;
const db_config_1 = __importDefault(require("../../config/db.config"));
const get_eligible_equbers_helper_1 = require("../../controllers/admin/equb/helper/get-eligible-equbers.helper");
const draw_lottery_job_1 = require("../draw-lottery.job");
const drawFinancialEqub = (equbId) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Am here financial equal", equbId);
    const equb = yield db_config_1.default.equb.findUnique({
        where: {
            id: equbId,
        },
        include: {
            equbType: true,
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
    // console.log("equb", equb);
    // console.log("equb from direct financial equb", equb?.currentRound);
    if (!equb)
        return null;
    const eligibleEqubers = yield (0, get_eligible_equbers_helper_1.getEligibleEqubers)(equb.equbers, equb.currentRound, equb.equbAmount);
    const eligibleEqubersLotteryNo = eligibleEqubers
        .map((eq) => eq.lotteryNumber)
        .toString();
    console.log("elligibeEqubers : ", eligibleEqubersLotteryNo);
    console.log(`Current round winners length: `, equb.currentRoundWinners);
    if (eligibleEqubers.length > 0) {
        const winners = yield (0, draw_lottery_job_1.selectRandomWinners)(eligibleEqubers, equb.currentRoundWinners);
        const winnersLotteryNo = winners.map((eq) => eq.lotteryNumber).toString();
        console.log("winners : ", winners);
        if (winners.length > 0) {
            // await prisma.lottery.create({
            //   data: {
            //     equbId: equb.id,
            //     winners: winnersLotteryNo,
            //     eligibleEqubers: eligibleEqubersLotteryNo,
            //     round: equb.currentRound,
            //   },
            // });
            // Update each winner's winRound
            for (const winner of winners) {
                //   const updatedEqub = (await prisma.equb.findUnique({where:{id:equb.id}})) as unknown as Equb
                const currentRound = equb.currentRound;
                console.log("current round on wnners func", currentRound);
                yield db_config_1.default.equber.update({
                    where: { id: winner.id },
                    data: {
                        winRound: currentRound,
                        hasWonEqub: true,
                    },
                });
            }
            yield db_config_1.default.equb.update({
                where: { id: equb.id },
                data: {
                    currentRound: { increment: winners.length },
                    previousRound: equb.currentRound,
                    hasLastRoundWinner: true,
                },
            });
            let updatedData = {};
            const latestEqub = (yield db_config_1.default.equb.findUnique({
                where: { id: equb.id },
                include: { equbers: true },
            }));
            const totalEqubersInEqub = latestEqub.equbers.length;
            const totalWonEqubersInEqub = latestEqub.equbers.filter((equber) => equber.hasWonEqub).length;
            if (totalEqubersInEqub == totalWonEqubersInEqub) {
                updatedData = {
                    status: "completed",
                };
            }
            else {
                // Calculate the next round date
                const nextRoundDate = new Date(equb.nextRoundDate || new Date());
                nextRoundDate.setDate(nextRoundDate.getDate() + equb.equbType.interval);
                updatedData = {
                    nextRoundDate: nextRoundDate,
                    nextRoundLotteryType: "request",
                    status: "started",
                };
            }
            // Set nextRoundLotteryType to null if the equbCategory is Car, House, or Travel
            if (["Car", "House", "Travel"].includes(equb.equbCategory.name)) {
                updatedData.nextRoundDate = null;
            }
            yield db_config_1.default.equb.update({
                where: { id: equb.id },
                data: updatedData,
            });
        }
        else {
            console.log(`No participantsincrement for Equb ${equb.name}`);
        }
    }
    else {
        console.log(`No eligible users to draw lottery for ${equb.name}`);
        let nextRoundDate = new Date(equb.nextRoundDate || new Date());
        nextRoundDate.setDate(nextRoundDate.getDate() + equb.equbType.interval);
        if (["Car", "House", "Travel"].includes(equb.equbCategory.name)) {
            nextRoundDate = null;
        }
        yield db_config_1.default.equb.update({
            where: { id: equb.id },
            data: {
                nextRoundDate: nextRoundDate,
                status: "started",
                hasLastRoundWinner: false,
            },
        });
    }
});
exports.drawFinancialEqub = drawFinancialEqub;
