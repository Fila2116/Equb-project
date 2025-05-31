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
exports.createEqubers = exports.deleteEquberRequestsOnly = exports.deleteEquberRequests = exports.findExistingGroups = void 0;
const db_config_1 = __importDefault(require("../../../../config/db.config"));
const payment_score_helper_1 = require("../../../user/payment/helper/payment-score.helper");
const chart_helper_1 = require("./chart.helper");
function generateLotteryNumber() {
    const digits = Math.floor(Math.random() * 900) + 100; // Generates a number between 100 and 999
    const letters = Array.from({ length: 3 }, () => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join(""); // Generates three random uppercase letters
    return `${digits}${letters}`;
}
function generateCustomLotteryNumber(equbCategoryName, equbTypeName) {
    const categoryPrefix = equbCategoryName.slice(0, 1).toUpperCase();
    const typePrefix = equbTypeName.slice(0, 1).toUpperCase();
    const randomDigits = Math.floor(Math.random() * 9000) + 1000; // Generates a number between 1000 and 9999
    // const randomLetters = Array.from({ length: 2 }, () =>
    //   String.fromCharCode(65 + Math.floor(Math.random() * 26))
    // ).join(""); // Generates two random uppercase letters
    return `${categoryPrefix}${typePrefix}${randomDigits}`;
}
function calculateTotalPaid(users) {
    return users.reduce((total, user) => total + user.totalPaid, 0);
}
const findExistingGroups = (equbId, stake) => __awaiter(void 0, void 0, void 0, function* () {
    const equb = yield db_config_1.default.equb.findUnique({
        where: { id: equbId },
        include: {
            equbers: {
                include: {
                    users: true,
                },
            },
        },
    });
    if (!equb)
        return [];
    return equb.equbers.filter((equber) => equber.isGruop &&
        equber.filledPercent !== 100 &&
        equber.users[0].stake == stake);
});
exports.findExistingGroups = findExistingGroups;
const deleteEquberRequests = (equberRequests) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("got here to delete");
    console.log(equberRequests);
    for (let i = 0; i < equberRequests.length; i++) {
        const equberRequest = equberRequests[i];
        console.log("equberRequest");
        console.log(equberRequest);
        console.log("equberRequest.users");
        console.log(equberRequest.users);
        for (let j = 0; j < equberRequest.users.length; j++) {
            const equberUser = equberRequest.users[j];
            yield db_config_1.default.equberUser.delete({ where: { id: equberUser.id } });
        }
        yield db_config_1.default.equberRequest.delete({ where: { id: equberRequest.id } });
    }
});
exports.deleteEquberRequests = deleteEquberRequests;
const deleteEquberRequestsOnly = (equberRequests) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("got here to delete");
    console.log(equberRequests);
    for (let i = 0; i < equberRequests.length; i++) {
        const equberRequest = equberRequests[i];
        console.log("equberRequest");
        console.log(equberRequest);
        yield db_config_1.default.equberRequest.delete({ where: { id: equberRequest.id } });
    }
});
exports.deleteEquberRequestsOnly = deleteEquberRequestsOnly;
const createEqubers = (equberRequests) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(equberRequests);
    for (let i = 0; i < equberRequests.length; i++) {
        const equberRequest = equberRequests[i];
        console.log(`Is group : ${equberRequest.isGruop}`);
        const equb = yield db_config_1.default.equb.findUnique({
            where: { id: equberRequest.equbId },
            include: {
                equbCategory: true,
                equbType: true,
            },
        });
        if (!equb) {
            throw new Error(`Equb with ID ${equberRequest.equbId} does not exist`);
        }
        const lotteryNumber = generateCustomLotteryNumber(equb.equbCategory.name, equb.equbType.name);
        if (equberRequest.isGruop) {
            const existingGroups = yield (0, exports.findExistingGroups)(equberRequest.equbId, equberRequest.users[0].stake);
            console.log("existingGroups");
            console.log(existingGroups);
            if (existingGroups.length > 0) {
                const existingEquber = yield db_config_1.default.equber.findUnique({
                    where: { id: existingGroups[0].id },
                });
                const { userId, stake, totalPaid, user, payments } = equberRequest.users[0];
                const equber = yield db_config_1.default.equber.update({
                    where: { id: existingEquber === null || existingEquber === void 0 ? void 0 : existingEquber.id },
                    data: {
                        users: {
                            create: {
                                userId: userId,
                                stake: stake,
                                totalPaid: totalPaid,
                                payments: {
                                    create: payments.map((payment) => ({
                                        amount: payment.amount,
                                        payment: { connect: { id: payment.paymentId } },
                                    })),
                                },
                            },
                        },
                        filledPercent: {
                            increment: stake,
                        },
                        totalPaid: {
                            increment: totalPaid,
                        },
                    },
                    include: {
                        users: {
                            include: {
                                user: true,
                                payments: true,
                            },
                        },
                    },
                });
                for (const equberUser of equber.users) {
                    const equbId = equber.equbId;
                    yield (0, payment_score_helper_1.updateEquberUserPaymentScore)(equberUser.id, equbId, equberUser.payments[0].createdAt);
                    console.log("equberUSER fromequber.helper.ts", equberUser);
                    (0, chart_helper_1.ChartHelper)(equberUser.payments[0]);
                }
            }
            else {
                const equber = yield db_config_1.default.equber.create({
                    data: {
                        lotteryNumber: lotteryNumber,
                        hasWonEqub: false,
                        equbId: equberRequest.equbId,
                        isGruop: true,
                        users: {
                            create: equberRequest.users.map((user) => ({
                                userId: user.userId,
                                stake: user.stake,
                                totalPaid: user.totalPaid,
                                payments: {
                                    create: user.payments.map((payment) => ({
                                        amount: payment.amount,
                                        payment: { connect: { id: payment.paymentId } },
                                    })),
                                },
                            })),
                        },
                        dividedBy: equberRequest.dividedBy,
                        payments: {
                            connect: equberRequest.payments.map((payment) => ({
                                id: payment.id,
                            })),
                        },
                        filledPercent: equberRequest.users[0].stake,
                        totalPaid: calculateTotalPaid(equberRequest.users),
                        paidRound: 0,
                        financePoint: 0,
                        kycPoint: 0,
                        adminPoint: 0,
                        totalEligibilityPoint: 0,
                        included: false,
                        excluded: false,
                        show: true,
                        winRound: null,
                    },
                    include: {
                        users: {
                            include: {
                                user: true,
                                payments: true,
                            },
                        },
                        payments: true,
                    },
                });
                for (const equberUser of equber.users) {
                    const equbId = equber.equbId;
                    yield (0, payment_score_helper_1.updateEquberUserPaymentScore)(equberUser.id, equbId, equberUser.payments[0].createdAt);
                    console.log("equber User payment", equberUser.payments[0]);
                    (0, chart_helper_1.ChartHelper)(equberUser.payments[0]);
                }
            }
        }
        else {
            const equber = yield db_config_1.default.equber.create({
                data: {
                    lotteryNumber: lotteryNumber, // Assuming a function to generate lottery numbers
                    hasWonEqub: equberRequest.hasWonEqub,
                    equbId: equberRequest.equbId,
                    isGruop: false,
                    users: {
                        create: equberRequest.users.map((user) => ({
                            userId: user.userId,
                            stake: user.stake,
                            totalPaid: user.totalPaid,
                            payments: {
                                create: user.payments.map((payment) => ({
                                    amount: payment.amount,
                                    payment: { connect: { id: payment.paymentId } },
                                })),
                            },
                        })),
                    },
                    dividedBy: equberRequest.dividedBy,
                    payments: {
                        connect: equberRequest.payments.map((payment) => ({
                            id: payment.id,
                        })),
                    },
                    filledPercent: 100,
                    totalPaid: calculateTotalPaid(equberRequest.users), // Assuming a function to calculate total paid
                    paidRound: 0, // Assuming starting round is 0
                    financePoint: 0, // Assuming finance point starts at 0
                    kycPoint: 0, // Assuming KYC point starts at 0
                    adminPoint: 0, // Assuming admin point starts at 0
                    totalEligibilityPoint: 0, // Assuming eligibility point starts at 0
                    included: false, // Assuming included starts as false
                    excluded: false, // Assuming excluded starts as false
                    show: true, // Assuming show starts as true
                    winRound: null, // Assuming winRound starts as null
                },
                include: {
                    users: {
                        include: {
                            user: true,
                            payments: true,
                        },
                    },
                },
            });
            const equberUser = equber.users[0];
            const equbId = equber.equbId;
            (0, payment_score_helper_1.updateEquberUserPaymentScore)(equberUser.id, equbId, equberUser.payments[0].createdAt);
            console.log("equber User payment", equberUser.payments[0]);
            (0, chart_helper_1.ChartHelper)(equberUser.payments[0]);
        }
    }
});
exports.createEqubers = createEqubers;
