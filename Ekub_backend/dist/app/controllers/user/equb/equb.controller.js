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
exports.savingMember = exports.getMyLotteryRequest = exports.updateLotteryRequest = exports.makeLotteryRequest = exports.makeEqubPayment = exports.getMyEqubPayment = exports.claimEqub = exports.GetEquberUser = exports.getUnwonUsers = exports.sendDeleteNotification = exports.sendGuarantorNotificaton = exports.saveGuarantee = exports.getGuarantee = exports.setGuarantee = exports.joinEqub = exports.getEqubLottery = exports.getEqubLotteries = exports.getEqubPayments = exports.getUserEqub = exports.getEqub = exports.getMyPendingEqubs = exports.getEqubs = exports.uploadGuaranteeImage = exports.uploadImage = void 0;
const db_config_1 = __importDefault(require("../../../config/db.config"));
const error_config_1 = require("../../../config/error.config");
const app_error_1 = __importDefault(require("../../../shared/errors/app.error"));
const notification_service_1 = require("../../../shared/notification/services/notification.service");
const multer_config_1 = require("../../../config/multer.config");
const get_eligible_equbers_helper_1 = require("../../admin/equb/helper/get-eligible-equbers.helper");
const payment_helper_1 = require("./helper/payment.helper");
const get_lottery_amount_helper_1 = require("./helper/get-lottery-amount.helper");
const web_socket_service_1 = require("../../../shared/web-socket/services/web-socket.service");
const event_name_enum_1 = require("../../../shared/web-socket/enums/event-name.enum");
const santim_pay_1 = require("../../../lib/santim_pay");
const constants_1 = require("../../../lib/santim_pay/utils/constants");
const upload = (0, multer_config_1.multerConfig)(multer_config_1.RESOURCES.PAYMENT, multer_config_1.DESTINANTIONS.IMAGE.PAYMENT, multer_config_1.FILTERS.IMAGE);
const guaranteeUpload = (0, multer_config_1.multerConfig)(multer_config_1.RESOURCES.GUARANTEE, multer_config_1.DESTINANTIONS.IMAGE.GUARANTEE, multer_config_1.FILTERS.IMAGE);
/**
 * Upload Middleware
 */
exports.uploadImage = {
    pre: upload.single("picture"),
    post: (req, _, next) => {
        console.log("req.file");
        console.log(req.file);
        if (req.file) {
            req.body.picture = req.file.filename;
        }
        next();
    },
};
/**
 * Upload Middleware
 */
exports.uploadGuaranteeImage = {
    pre: guaranteeUpload.single("picture"),
    post: (req, _, next) => {
        console.log("req.file");
        console.log(req.file);
        if (req.file) {
            req.body.picture = req.file.filename;
        }
        next();
    },
};
exports.getEqubs = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const branchId = query.branch;
    const page = Number(query._page) || 1;
    const limit = Number(query._limit) || 11;
    const skip = Number((page - 1) * limit);
    //       const filter = (req as any).filter || {};
    // req.filters = req.query;
    // let filters: any = {};
    // let sortOrder: any = {};
    // if (query.sortBy) {
    //   if (query.sortBy === "newest") {
    //     sortOrder = { nextRoundDate: "desc" };
    //   } else if (query.sortBy === "oldest") {
    //     sortOrder = { nextRoundDate: "asc" };
    //   }
    // }
    // (req as any).sortOrder = sortOrder;
    // if (query._search) {
    //   filters.name = {
    //     contains: query._search,
    //     mode: "insensitive",
    //   };
    // }
    let { filters } = req;
    // console.log("Constructed req:", req.filters);
    // console.log(sortOrder);
    const [equbs, total] = yield Promise.all([
        db_config_1.default.equb.findMany({
            where: filters,
            include: {
                equbType: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                Payment: true,
                equbCategory: {
                    select: {
                        id: true,
                        name: true,
                        needsRequest: true,
                        isSaving: true,
                    },
                },
                equbers: {
                    select: { id: true, lotteryNumber: true },
                },
                branch: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            take: limit,
            skip,
        }),
        db_config_1.default.equb.count({
            where: filters,
        }),
    ]);
    res.status(200).json({
        status: "success",
        data: {
            equbs,
            meta: {
                page,
                limit,
                total,
            },
        },
    });
}));
exports.getMyPendingEqubs = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const query = req.query;
    const branchId = query.branch;
    const page = Number(query._page) || 1;
    const limit = Number(query._limit) || 11;
    const skip = Number((page - 1) * limit);
    console.log("req.filters");
    console.log(req.filters);
    const [payments, total] = yield Promise.all([
        db_config_1.default.payment.findMany({
            where: {
                type: "registering",
                approved: false,
                userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
            },
            include: {
                equb: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                equberUserPayments: true,
            },
            take: limit,
            skip,
        }),
        db_config_1.default.payment.count({
            where: {
                type: "registering",
                approved: false,
                userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id,
            },
        }),
    ]);
    res.status(200).json({
        status: "success",
        data: {
            payments,
            meta: {
                page,
                limit,
                total,
            },
        },
    });
}));
exports.getEqub = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const equb = yield db_config_1.default.equb.findUnique({
        where: {
            id: req.params.id,
        },
        include: {
            equbType: {
                select: {
                    id: true,
                    name: true,
                },
            },
            equbCategory: {
                select: {
                    id: true,
                    name: true,
                    isSaving: true,
                },
            },
            branch: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });
    if (!equb) {
        return next(new app_error_1.default(`Equb with ID ${req.params.id} does not exist`, 400));
    }
    res.status(200).json({
        status: "success",
        data: {
            equb,
        },
    });
}));
exports.getUserEqub = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userEqub = yield db_config_1.default.user.findUnique({
        where: {
            id: req.params.userId,
        },
        include: {
            joinedEqubs: {
                include: {
                    equbType: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    equbCategory: {
                        select: {
                            id: true,
                            name: true,
                            isSaving: true,
                        },
                    },
                    branch: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
        },
    });
    console.log("userEqub", userEqub);
    if (!userEqub) {
        return next(new app_error_1.default(`user with ID ${req.params.id} does not exist`, 400));
    }
    res.status(200).json({
        status: "success",
        data: {
            userEqub,
        },
    });
}));
exports.getEqubPayments = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const equb = (yield db_config_1.default.equb.findUnique({
        where: {
            id: req.params.id,
        },
        include: {
            equbers: {
                include: {
                    users: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    fullName: true,
                                },
                            },
                        },
                    },
                    payments: true,
                    lotteryRequest: true,
                },
            },
        },
    }));
    if (!equb) {
        return next(new app_error_1.default(`Equb with ID ${req.params.id} does not exist`, 400));
    }
    // return res.json({equbers:equb.equbers})
    res.status(200).json({
        status: "success",
        data: {
            equbRound: equb.currentRound,
            equbersPaid: (0, payment_helper_1.equbersPaid)(equb),
            equbers: equb.equbers.length,
            payments: (0, payment_helper_1.structuredPayment)(equb, (_c = req.user) === null || _c === void 0 ? void 0 : _c.id),
        },
    });
}));
exports.getEqubLotteries = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const equb = yield db_config_1.default.equb.findUnique({
        where: {
            id: req.params.id,
        },
    });
    if (!equb) {
        return next(new app_error_1.default(`Equb with ID ${req.params.id} does not exist`, 400));
    }
    const equbMembers = yield db_config_1.default.equber.findMany({
        where: {
            equbId: req.params.id,
            hasWonEqub: true,
        },
        include: {
            users: {
                include: { user: true, guarantee: true },
            },
        },
    });
    res.status(200).json({
        status: "success",
        data: {
            lotteries: equbMembers.map((equbMember) => ({
                users: equbMember.users.map((equbUser) => {
                    return {
                        lotteryNumber: equbMember.lotteryNumber,
                        equberUserId: equbUser.id,
                        userId: equbUser.user.id,
                        hasGuarantee: Boolean(equbUser.guaranteeId) ||
                            Boolean(equbUser.guaranteeUserId),
                        totalLotteryAmount: (0, get_lottery_amount_helper_1.getLotteryAmount)(equb, equbUser.stake),
                        netLotteryAmount: (0, get_lottery_amount_helper_1.getNetLotteryAmount)(equb, equbUser.stake),
                        hasClaimed: equbUser.hasClaimed,
                        hasTakenEqub: equbUser.hasTakenEqub,
                        userFullName: equbMember.isGruop
                            ? "Group"
                            : equbMember.users[0].user.fullName,
                        round: equbMember.winRound,
                    };
                }),
            })),
        },
    });
}));
exports.getEqubLottery = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const equb = yield db_config_1.default.equb.findUnique({
        where: {
            id: req.params.id,
        },
        include: {
            equbCategory: true,
        },
    });
    if (!equb) {
        return next(new app_error_1.default(`Equb with ID ${req.params.id} does not exist`, 400));
    }
    console.log("equb.hasLastRoundWinner", equb.hasLastRoundWinner);
    if (equb.hasLastRoundWinner) {
        const equbMembers = yield db_config_1.default.equber.findMany({
            where: {
                equbId: req.params.id,
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
                equbId: req.params.id,
                winRound: equb.previousRound,
            },
            include: {
                users: {
                    include: { user: true },
                },
            },
        });
        web_socket_service_1.WebSocketService.getInstance().publish(event_name_enum_1.EventNames.EQUB_ElIGIBLE, {
            eligibleMembers,
            currentRoundWinners,
            equbEligibleMembers,
        }, req.params.id);
        return res.status(200).json({
            status: "success",
            data: {
                eligibleMembers,
                currentRoundWinners,
                equbEligibleMembers,
            },
        });
    }
    else {
        return res.status(200).json({
            status: "success",
            data: {
                eligibleMembers: [],
                currentRoundWinners: [],
                equbEligibleMembers: [],
            },
        });
    }
}));
exports.joinEqub = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _d, _e, _f, _g, _h;
    console.log("got here");
    console.log(req.body);
    const { paidAmount, equbers, paymentMethod, picture, phoneNumber } = req.body;
    if (!paidAmount || !equbers || !paymentMethod) {
        return next(new app_error_1.default("Missing required fields in request body.", 400));
    }
    const equb = yield db_config_1.default.equb.findUnique({
        where: { id: req.params.id },
    });
    if (!equb) {
        return next(new app_error_1.default(`Equb with ID ${req.params.id} does not exist`, 400));
    }
    if (!((_d = req.user) === null || _d === void 0 ? void 0 : _d.id)) {
        return next(new app_error_1.default("User not authenticated", 401));
    }
    console.log("User", (_e = req.user) === null || _e === void 0 ? void 0 : _e.id);
    const client = new santim_pay_1.SantimpaySdk(process.env.GATEWAY_MERCHAT_ID, constants_1.PRIVATE_KEY_IN_PEM);
    const successRedirectUrl = "http://dashboard.hageregnaequb.com/dashboard/home";
    const failureRedirectUrl = "http://dashboard.hageregnaequb.com/dashboard/payment";
    const cancelRedirectUrl = "http://api.hageregnaequb.com/";
    const notifyUrl = "https://api.hageregnaequb.com/api/v1/user/payment/notify";
    const transactionId = Math.floor(Math.random() * 1000000000).toString();
    // Declare payment outside so it's accessible
    let payment = null;
    let checkoutUrl = null;
    console.log("Payment data:", {
        type: "registering",
        paymentMethod,
        amount: paidAmount,
        round: 1,
        equbId: equb.id,
        userId: (_f = req.user) === null || _f === void 0 ? void 0 : _f.id,
        picture: picture || null,
        state: "inactive",
        transactionId,
    });
    console.log("paymentMethod", paymentMethod);
    if (paymentMethod === "santimpay") {
        payment = yield db_config_1.default.payment.create({
            data: {
                type: "registering",
                paymentMethod,
                amount: 0,
                round: 1,
                equbId: equb.id,
                userId: (_g = req.user) === null || _g === void 0 ? void 0 : _g.id,
                picture: picture || null,
                state: "inactive",
                transactionId,
            },
        });
        // checkoutUrl = await client.generatePaymentUrl(
        //   transactionId,
        //   paidAmount,
        //   "Payment for joining Equb",
        //   successRedirectUrl,
        //   failureRedirectUrl,
        //   notifyUrl,
        //   phoneNumber,
        //   cancelRedirectUrl
        // );
        console.log("checkoutUrl", checkoutUrl);
    }
    else {
        payment = yield db_config_1.default.payment.create({
            data: {
                type: "registering",
                paymentMethod,
                amount: paidAmount,
                round: 1,
                equbId: equb.id,
                userId: (_h = req.user) === null || _h === void 0 ? void 0 : _h.id,
                picture: picture || null,
                state: "inactive",
                transactionId,
            },
        });
        console.log("payment in bank method", payment);
    }
    if (!payment || !payment.id) {
        return next(new app_error_1.default("Payment creation failed", 500));
    }
    let equbRequests = [];
    function iterateEachEquber(equb) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all(equbers.map((equber) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const stake = equber.stake;
                const paidAmount = equber.paidAmount;
                const equberRequest = yield db_config_1.default.equberRequest.create({
                    data: {
                        equbId: equb.id,
                        isGruop: stake !== 100,
                        users: {
                            create: [
                                {
                                    userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
                                    stake,
                                    totalPaid: paidAmount,
                                    payments: (payment === null || payment === void 0 ? void 0 : payment.id)
                                        ? {
                                            create: {
                                                amount: paidAmount,
                                                payment: {
                                                    connect: { id: payment.id },
                                                },
                                            },
                                        }
                                        : undefined, // Avoid connecting `undefined` ID
                                },
                            ],
                        },
                        payments: (payment === null || payment === void 0 ? void 0 : payment.id)
                            ? { connect: { id: payment.id } }
                            : undefined, // Avoid connecting `undefined` ID
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
                equbRequests.push(equberRequest);
            })));
        });
    }
    yield iterateEachEquber(equb);
    res.status(200).json({
        status: "success",
        data: {
            equbRequests,
            checkoutUrl,
        },
    });
}));
exports.setGuarantee = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("req.body");
    console.log(req.body);
    const { firstName, lastName, phoneNumber, fileName } = req.body;
    console.log(`File name: ${fileName}`);
    // Updated regex to match phone numbers starting with +251 followed by 9 digits
    const phoneRegex = /^\+251\d{9}$/;
    if (!firstName || !lastName || !phoneNumber || !fileName) {
        return next(new app_error_1.default("Missing required fields in request body.", 400));
    }
    if (!phoneRegex.test(phoneNumber)) {
        return next(new app_error_1.default("Invalid phone number format. Must start with +251 and be followed by 9 digits.", 400));
    }
    let equberUser = yield db_config_1.default.equberUser.findFirst({
        where: {
            id: req.params.id,
        },
    });
    if (!equberUser) {
        return next(new app_error_1.default(`There is no Equber user with Id ${req.params.id} .`, 400));
    }
    const guarantee = yield db_config_1.default.guarantee.create({
        data: {
            firstName: firstName,
            lastName: lastName,
            fullName: `${firstName} ${lastName}`,
            phoneNumber: phoneNumber,
            picture: fileName ? fileName : null,
        },
    });
    equberUser = yield db_config_1.default.equberUser.update({
        where: { id: equberUser.id },
        data: {
            guaranteeId: guarantee.id,
        },
    });
    res.status(200).json({
        status: "success",
        data: {
            guarantee,
        },
    });
}));
exports.getGuarantee = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userEqubData = yield db_config_1.default.equberUser.findUnique({
        where: {
            id: req.params.id,
        },
        include: {
            user: true,
        },
    });
    // If equberUser is not found
    if (!userEqubData) {
        return next(new app_error_1.default(`No Equber User found with ID ${req.params.id}.`, 404));
    }
    // If no guaranteeId is set for the user
    if (!userEqubData.guaranteeUserId) {
        return next(new app_error_1.default(`This user has no guarantee set.`, 400));
    }
    const guarantee = yield db_config_1.default.user.findUnique({
        where: {
            id: userEqubData.guaranteeUserId,
        },
    });
    // If guarantee is not found
    if (!guarantee) {
        return next(new app_error_1.default(`No Guarantee found with ID ${userEqubData.guaranteeId}.`, 404));
    }
    return res.status(200).json({
        status: "success",
        data: {
            userEqubData,
            guarantee,
        },
    });
}));
exports.saveGuarantee = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _j, _k;
    const { userId, guaranteToBe } = req.body;
    console.log("guaranteToBe....", guaranteToBe);
    console.log("userId....", userId);
    let user = yield db_config_1.default.user.findUnique({
        where: {
            id: userId,
        },
        include: {
            deviceTokens: true,
        },
    });
    console.log(" req.user?.id", (_j = req.user) === null || _j === void 0 ? void 0 : _j.id);
    if (!user) {
        return next(new app_error_1.default(`There is no  user with Id ${userId} .`, 400));
    }
    if (user.id === ((_k = req.user) === null || _k === void 0 ? void 0 : _k.id)) {
        return next(new app_error_1.default(`You can not choose yourself as a guarantee.`, 400));
    }
    const equberUser = yield db_config_1.default.equberUser.update({
        where: { id: req.params.id },
        data: {
            guaranteeUserId: guaranteToBe,
        },
    });
    if (!equberUser) {
        return next(new app_error_1.default(`There is no  equberUser with Id ${req.params.id} .`, 400));
    }
    //     await SMSService.sendSms(
    //       user.phoneNumber!,
    //       `Hi ${user.fullName},
    // ${CurrentUser?.firstName} has selected you as their guarantor for their Equb. Please review and approve their request at your earliest convenience.`
    //     );
    const tokens = user === null || user === void 0 ? void 0 : user.deviceTokens.map((token) => token.token);
    console.log("tokens");
    console.log(tokens);
    // @ts-ignore
    notification_service_1.PushNotification.getInstance().sendNotification(`Hi ${user.fullName}`, `${req.body.fullName} has received your guarantor request.`, tokens, {
        payload: "request",
    });
    yield db_config_1.default.notification.create({
        data: {
            title: "Hagerigna Equb",
            body: `${req.body.fullName} has received your guarantor request.`,
            userId: `${user.id}`,
        },
    });
    res.status(200).json({
        status: "success",
        messgae: "Your Guarantor accepts you succesfully",
        data: equberUser,
    });
}));
exports.sendGuarantorNotificaton = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _l, _m, _o, _p, _q, _r, _s;
    const { userId } = req.body;
    console.log("send Guarantor exist");
    let user = yield db_config_1.default.user.findUnique({
        where: {
            id: userId,
        },
        include: {
            deviceTokens: true,
        },
    });
    console.log(" req.params.id", req.params.id);
    console.log("selected user", user);
    if (!user) {
        return next(new app_error_1.default(`There is no  user with Id ${userId} .`, 400));
    }
    if (user.id === ((_l = req.user) === null || _l === void 0 ? void 0 : _l.id)) {
        return next(new app_error_1.default(`You can not choose yourself as a guarantee.`, 400));
    }
    // const equberUser = await prisma.equberUser.update({
    //   where: { id: req.params.id },
    //   data: {
    //     guaranteeUserId: userId,
    //   },
    // });
    // if (!equberUser) {
    //   return next(
    //     new AppError(`There is no  equberUser with Id ${req.params.id} .`, 400)
    //   );
    // }
    //     await SMSService.sendSms(
    //       user.phoneNumber!,
    //       `Hi ${user.fullName},
    // ${CurrentUser?.firstName} has selected you as their guarantor for their Equb. Please review and approve their request at your earliest convenience.`
    //     );
    const tokens = user === null || user === void 0 ? void 0 : user.deviceTokens.map((token) => token.token);
    console.log("tokens");
    console.log(tokens);
    // @ts-ignore
    notification_service_1.PushNotification.getInstance().sendNotification(`Hi ${user.fullName}`, `${req.body.fullName} has selected you as their guarantor for their Equb. Please review and approve their request at your earliest convenience.`, tokens, {
        payload: "request",
        guaranteeId: ((_m = req.body.userId) === null || _m === void 0 ? void 0 : _m.toString()) || "",
        equbId: ((_o = req.params.id) === null || _o === void 0 ? void 0 : _o.toString()) || "",
        equbName: ((_p = req.body.equbName) === null || _p === void 0 ? void 0 : _p.toString()) || "",
        equbAmount: ((_q = req.body.equbAmount) === null || _q === void 0 ? void 0 : _q.toString()) || "",
        fullName: ((_r = req.body.fullName) === null || _r === void 0 ? void 0 : _r.toString()) || "",
        guaranteeNeedyId: ((_s = req.body.firstUserId) === null || _s === void 0 ? void 0 : _s.toString()) || "",
    });
    yield db_config_1.default.notification.create({
        data: {
            title: "Hagerigna Equb",
            body: `${req.body.fullName} has selected you as their guarantor for their Equb. Please review and approve their request at your earliest convenience.`,
            userId: `${user.id}`,
        },
    });
    res.status(200).json({
        status: "success",
        messgae: "You sent the Guarantor succesfully",
        // data: equberUser,
    });
}));
exports.sendDeleteNotification = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body;
    let user = yield db_config_1.default.user.findUnique({
        where: {
            id: userId,
        },
        include: {
            deviceTokens: true,
        },
    });
    console.log(" req.params.id", req.params.id);
    console.log("selected user", user);
    if (!user) {
        return next(new app_error_1.default(`There is no  user with Id ${userId} .`, 400));
    }
    const tokens = user === null || user === void 0 ? void 0 : user.deviceTokens.map((token) => token.token);
    console.log("tokens");
    console.log(tokens);
    // @ts-ignore
    notification_service_1.PushNotification.getInstance().sendNotification(`Hi ${user.fullName}`, `${req.body.fullName}has rejected your guarantor request for your Equb.`, tokens, {
        type: "test",
    });
    yield db_config_1.default.notification.create({
        data: {
            title: "Hagerigna Equb",
            body: `${req.body.fullName} has removed you as their guarantor for their Equb. Please contact them if you have any questions.`,
            userId: `${user.id}`,
        },
    });
    res.status(200).json({
        status: "success",
        messgae: "The delete guarantor notification was sent successfully.",
        // data: equberUser,
    });
}));
exports.getUnwonUsers = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield db_config_1.default.user.findMany({
        where: {
            equberUsers: {
                some: {
                    hasTakenEqub: false,
                },
            },
        },
        include: {
            equberUsers: {
                where: {
                    hasTakenEqub: false,
                },
            },
        },
    });
    return res.status(200).json({
        status: "success",
        data: users,
        unwonUsersCount: users.length,
    });
}));
exports.GetEquberUser = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("equbId", req.params.equbId);
    console.log("userId", req.params.userId);
    // Fetch the Equber users and include the related Equber model
    const equberUsers = yield db_config_1.default.equberUser.findMany({
        where: {
            userId: req.params.userId,
            equber: {
                equbId: req.params.equbId,
                lotteryNumber: {
                    not: '',
                },
            },
        },
        include: {
            equber: {
                select: {
                    lotteryNumber: true,
                },
            },
        },
    });
    if (!equberUsers || equberUsers.length === 0) {
        return next(new app_error_1.default(`No Equber user with Equb ID ${req.params.equbId}.`, 400));
    }
    // Format the data as a list
    const data = equberUsers.map((user) => {
        var _a, _b;
        return ({
            hasClaimed: true,
            stake: user.stake,
            lotteryNumber: (_b = (_a = user.equber) === null || _a === void 0 ? void 0 : _a.lotteryNumber) !== null && _b !== void 0 ? _b : null,
        });
    });
    res.status(200).json({
        status: "success",
        data,
    });
}));
exports.claimEqub = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _t, _u;
    const { selectedBankAccount } = req.body;
    // Fetch the Equber user and include their bankAccounts
    const equberUser = yield db_config_1.default.equberUser.findUnique({
        where: { id: req.params.id },
        include: {
            user: {
                include: {
                    bankAccounts: true,
                },
            },
        },
    });
    if (!equberUser) {
        return next(new app_error_1.default(`No Equber user with ID ${req.params.id}. `, 400));
    }
    // Find the account in the user's bankAccounts array
    const accountExists = (_u = (_t = equberUser === null || equberUser === void 0 ? void 0 : equberUser.user) === null || _t === void 0 ? void 0 : _t.bankAccounts) === null || _u === void 0 ? void 0 : _u.some((account) => account.accountNumber === selectedBankAccount);
    // Update the selected account to isPrimary = true
    if (accountExists) {
        yield db_config_1.default.user.update({
            where: { id: equberUser.user.id },
            data: {
                bankAccounts: {
                    updateMany: [
                        // Set all accounts' isPrimary to false
                        { where: {}, data: { isPrimary: false } },
                        // Set the selected account's isPrimary to true
                        {
                            where: { accountNumber: selectedBankAccount },
                            data: { isPrimary: true },
                        },
                    ],
                },
            },
        });
    }
    yield db_config_1.default.equberUser.update({
        where: { id: req.params.id },
        data: {
            hasClaimed: true,
        },
    });
    res.status(200).json({
        status: "success",
        data: {
            hasClaimed: true,
        },
    });
}));
exports.getMyEqubPayment = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _v;
    const query = req.query;
    const approved = query.approved === "true" ? true : false;
    const equb = yield db_config_1.default.equb.findUnique({
        where: {
            id: req.params.id,
        },
    });
    if (!equb) {
        return next(new app_error_1.default(`Equb with ID ${req.params.id} does not exist`, 400));
    }
    const payments = yield db_config_1.default.payment.findMany({
        where: {
            equbId: equb.id,
            userId: (_v = req.user) === null || _v === void 0 ? void 0 : _v.id,
            approved: approved,
        },
        include: {
            equb: {
                select: {
                    name: true,
                },
            },
            equberUserPayments: {
                include: {
                    equberUser: {
                        select: {
                            equber: {
                                select: {
                                    lotteryNumber: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });
    res.status(200).json({
        status: "success",
        data: {
            payments: payments.map((payment) => ({
                id: payment.id,
                amount: payment.amount,
                equbName: payment.equb.name,
                picture: payment.picture,
                payments: payment.equberUserPayments.map((equberUserPayment) => {
                    var _a, _b;
                    return ({
                        lotteryNumber: (_b = (_a = equberUserPayment.equberUser) === null || _a === void 0 ? void 0 : _a.equber) === null || _b === void 0 ? void 0 : _b.lotteryNumber,
                        amount: equberUserPayment.amount,
                    });
                }),
            })),
        },
    });
}));
exports.makeEqubPayment = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _w, _x, _y;
    console.log("got here");
    console.log(req.body);
    const { paidAmount, lottery, paymentMethod, phoneNumber, picture } = req.body;
    const equb = yield db_config_1.default.equb.findUnique({
        where: {
            id: req.params.id,
        },
    });
    if (!equb) {
        return next(new app_error_1.default(`Equb with ID ${req.params.id} does not exist`, 400));
    }
    // const client = new SantimpaySdk(
    //   process.env.GATEWAY_MERCHAT_ID!,
    //   PRIVATE_KEY_IN_PEM!
    // );
    const successRedirectUrl = "http://dashboard.hageregnaequb.com/dashboard/home";
    const failureRedirectUrl = "http://dashboard.hageregnaequb.com/dashboard/payment";
    const cancelRedirectUrl = "http://api.hageregnaequb.com/";
    // backend utus update (webhook)
    // const notifyUrl = "http://localhosrl to receive a stat/api/v1/user/payment/notify";
    const notifyUrl = "https://api.hageregnaequb.com/api/v1/user/payment/notify";
    const transactionId = Math.floor(Math.random() * 1000000000).toString();
    let payment;
    console.log("Payment data:", {
        type: "registering",
        paymentMethod: paymentMethod,
        amount: paidAmount,
        round: equb.currentRound,
        equbId: equb.id,
        userId: (_w = req.user) === null || _w === void 0 ? void 0 : _w.id,
        picture: picture || null,
        state: "inactive",
        transactionId: transactionId,
    });
    if (paymentMethod === "santimpay") {
        payment = yield db_config_1.default.payment.create({
            data: {
                type: "registering",
                paymentMethod: paymentMethod,
                amount: 0,
                round: equb.currentRound,
                equbId: equb.id,
                userId: (_x = req.user) === null || _x === void 0 ? void 0 : _x.id,
                picture: picture || null,
                state: "inactive",
                transactionId: transactionId || "",
            },
        });
        console.log("santimPay payment...", payment);
    }
    else {
        payment = yield db_config_1.default.payment.create({
            data: {
                type: "equb",
                paymentMethod: paymentMethod,
                amount: paidAmount,
                round: equb.currentRound,
                equbId: equb.id,
                userId: (_y = req.user) === null || _y === void 0 ? void 0 : _y.id,
                state: "inactive",
                picture: picture || null,
                transactionId: transactionId || "",
            },
        });
        console.log("bank payment...", payment);
    }
    // const checkoutUrl = await client.generatePaymentUrl(
    //   transactionId,
    //   paidAmount,
    //   "Payment for joining Equb",
    //   successRedirectUrl,
    //   failureRedirectUrl,
    //   notifyUrl,
    //   phoneNumber,
    //   cancelRedirectUrl
    // );
    // console.log("checkoutUrl", checkoutUrl);
    console.log("lottery...", lottery);
    // let payment = await prisma.payment.create({
    //   data: {
    //     type: "equb",
    //     paymentMethod: paymentMethod,
    //     amount: paidAmount,
    //     round: equb.currentRound,
    //     equbId: equb.id,
    //     userId: req.user?.id!,
    //   },
    // });
    console.log("equber...", payment);
    for (let i = 1; i <= lottery.length; i++) {
        const equber = lottery[i - 1];
        const equberUserId = equber.id;
        const paidAmount = Number(equber.paidAmount);
        const equberUser = (yield db_config_1.default.equberUser.findUnique({
            where: {
                id: equberUserId,
            },
        }));
        if (equberUser) {
            const equberUserPayment = yield db_config_1.default.equberUserPayment.create({
                data: {
                    payment: {
                        connect: {
                            id: payment.id,
                        },
                    },
                    amount: paidAmount,
                    equberUser: {
                        connect: {
                            id: equberUser.id,
                        },
                    },
                },
            });
        }
        else {
            console.log(`Equber user with id ${equberUserId} not found.`);
        }
    }
    const equbPayment = yield db_config_1.default.payment.findUnique({
        where: {
            id: payment.id,
        },
        include: { equberUserPayments: true },
    });
    res.status(200).json({
        status: "success",
        data: {
            equbPayment,
        },
    });
}));
exports.makeLotteryRequest = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { itemName, description, amount } = req.body;
    const equber = yield db_config_1.default.equber.findUnique({
        where: {
            id: req.params.id,
        },
    });
    if (!equber) {
        return next(new app_error_1.default(`Equber with ID ${req.params.id} does not exist`, 400));
    }
    const request = yield db_config_1.default.lotteryRequest.create({
        data: {
            equberId: req.params.id,
            itemName: itemName,
            description: description,
            amount: Number(amount),
        },
    });
    res.status(200).json({
        status: "success",
        data: {
            request,
        },
    });
}));
exports.updateLotteryRequest = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { itemName, description, amount } = req.body;
    const updatedData = {};
    if (itemName)
        updatedData.itemName = itemName;
    if (description)
        updatedData.description = description;
    if (amount)
        updatedData.amount = Number(amount);
    const request = yield db_config_1.default.lotteryRequest.update({
        where: {
            id: req.params.id,
        },
        data: updatedData,
    });
    res.status(200).json({
        status: "success",
        data: {
            request,
        },
    });
}));
exports.getMyLotteryRequest = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const request = yield db_config_1.default.lotteryRequest.findUnique({
        where: {
            equberId: req.params.id,
        },
    });
    res.status(200).json({
        status: "success",
        data: {
            request,
        },
    });
}));
exports.savingMember = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const equb = yield db_config_1.default.equb.findUnique({
        where: { id: req.params.id },
        select: {
            id: true,
            description: true,
            name: true,
            equbAmount: true,
            startDate: true,
            endDate: true,
            goal: true,
            equbers: {
                include: {
                    users: {
                        include: {
                            user: true,
                        },
                    },
                    payments: true,
                    paymentHistories: true,
                },
            },
        },
    });
    if (!equb) {
        return next(new app_error_1.default(`Equb with ID ${req.params.id} does not exist`, 404));
    }
    const equbers = equb.equbers.filter((equber) => { var _a; return (_a = equber.users) === null || _a === void 0 ? void 0 : _a.some((user) => { var _a; return user.user.id === ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id); }); });
    const totalPaid = equbers.reduce((acc, equber) => {
        return acc + equber.totalPaid;
    }, 0);
    res.status(200).json({
        status: "success",
        data: {
            payments: {
                equb: {
                    id: equb.id,
                    name: equb.name,
                    goal: equb.goal * equbers.length,
                    equbAmount: equb.equbAmount,
                    totalPaid,
                },
                lotteries: equbers.map((equber) => {
                    return {
                        lotteryNumber: equber.lotteryNumber,
                        equberUserId: equber.users[0].id,
                        totalPaid: equber.totalPaid,
                        lastPaidOn: equber.paymentHistories.length > 0
                            ? equber.paymentHistories[equber.paymentHistories.length - 1]
                                .createdAt
                            : null,
                    };
                }),
            },
        },
    });
}));
