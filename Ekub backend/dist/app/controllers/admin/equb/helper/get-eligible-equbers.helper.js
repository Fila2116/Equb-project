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
exports.getEligibleEqubersForRequest = exports.getEligibleEqubersForMobileWithRequest = exports.getEligibleEqubersForMobile = exports.getEligibleEqubers = void 0;
const db_config_1 = __importDefault(require("../../../../config/db.config"));
const getEligibleEqubers = (equbers, round, equbAmount) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("finance equbers");
    console.log(equbers.map((eq) => eq.lotteryNumber));
    // return equbers.filter(equber=> equber.hasWonEqub===false)
    const expectedPaidAmount = round * equbAmount;
    console.log(`round: ${round}`);
    console.log(`equbAmount: ${equbAmount}`);
    console.log(`expectedPaidAmount: ${expectedPaidAmount}`);
    return equbers.filter((equber) => {
        console.log(`${equber.lotteryNumber} paid ${equber.totalPaid} / ${expectedPaidAmount}`);
        // console.log(`${equber.lotteryNumber} - ${equber.hasWonEqub}`);
        // console.log(`${equber.lotteryNumber} - ${equber.excluded}`);
        // console.log(`${equber.lotteryNumber} - ${equber.included}`);
        if (equber.hasWonEqub)
            return false;
        console.log(`${equber.lotteryNumber} - ${equber.excluded}`);
        if (equber.excluded)
            return false;
        console.log("exclude");
        if (equber.included)
            return true;
        console.log("include");
        if (equber.totalPaid >= expectedPaidAmount) {
            return true;
        }
        else {
            return false;
        }
    });
});
exports.getEligibleEqubers = getEligibleEqubers;
const getEligibleEqubersForMobile = (equbers, round, equbAmount) => __awaiter(void 0, void 0, void 0, function* () {
    const expectedPaidAmount = round * equbAmount;
    console.log("equbers from mobile", equbers);
    return equbers.filter((equber) => {
        console.log(`${equber.lotteryNumber} paid ${equber.totalPaid} / ${expectedPaidAmount}`);
        console.log(`${equber.lotteryNumber} - ${equber.hasWonEqub}`);
        console.log(`${equber.lotteryNumber} - ${equber.excluded}`);
        console.log(`${equber.lotteryNumber} - ${equber.included}`);
        if (equber.hasWonEqub)
            return false;
        console.log("hasWonEqub");
        if (equber.excluded)
            return false;
        console.log("exclude");
        if (equber.included)
            return true;
        console.log("include");
        if (equber.totalPaid >= expectedPaidAmount) {
            return true;
        }
        else {
            return false;
        }
    });
});
exports.getEligibleEqubersForMobile = getEligibleEqubersForMobile;
const getEligibleEqubersForMobileWithRequest = (equbers, round, equbAmount) => __awaiter(void 0, void 0, void 0, function* () {
    const Requbers = equbers;
    const equbersWhoHaveNotWon = Requbers.filter((equber) => equber.hasWonEqub === false || equber.winRound == round - 1);
    const eligibleEqubers = equbersWhoHaveNotWon.filter((equber) => equber.lotteryRequest);
    if (eligibleEqubers.length > 0) {
        return eligibleEqubers;
    }
    else {
        return equbersWhoHaveNotWon;
    }
    // const expectedPaidAmount = round*equbAmount;
    // return equbers.filter(equber=>{
    //     if(equber.excluded) return false;
    //     if(equber.hasWonEqub===true || equber.winRound==round-1) return false;
    //     if(equber.show) return true;
    //     // if(equber.totalPaid>= expectedPaidAmount){
    //     //     return true
    //     // }else{
    //     //     return false
    //     // }
    // })
});
exports.getEligibleEqubersForMobileWithRequest = getEligibleEqubersForMobileWithRequest;
const getEligibleEqubersForRequest = (equbId) => __awaiter(void 0, void 0, void 0, function* () {
    const equb = yield db_config_1.default.equb.findUnique({
        where: { id: equbId },
        include: {
            equbers: {
                include: {
                    lotteryRequest: true,
                    users: {
                        include: {
                            user: true,
                        },
                    },
                },
            },
        },
    });
    if (!equb)
        return [];
    const { equbers, currentRound, equbAmount } = equb;
    const round = currentRound;
    console.log("requested equbers");
    console.log(equbers);
    const equbersWhoHaveNotWon = equbers.filter((equber) => !equber.hasWonEqub && !equber.excluded && equber.show);
    // const equbersWhoHaveNotWon = equbers.filter(
    //   (equber) => !equber.hasWonEqub && !equber.excluded && equber.show && equber.included
    // );
    console.log("equbersWhoHaveNotWon equbers");
    console.log(equbersWhoHaveNotWon);
    const eligibleEqubers = equbersWhoHaveNotWon.filter((equber) => equber.lotteryRequest);
    console.log("eligibleEqubers requeste....");
    console.log(eligibleEqubers);
    if (eligibleEqubers.length > 0) {
        return eligibleEqubers;
    }
    else {
        return equbersWhoHaveNotWon;
    }
});
exports.getEligibleEqubersForRequest = getEligibleEqubersForRequest;
