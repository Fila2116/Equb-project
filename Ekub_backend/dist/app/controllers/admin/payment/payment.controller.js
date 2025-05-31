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
exports.getPendingPayments = exports.approvePayment = exports.getPayment = exports.getExportPayments = exports.getPayments = void 0;
const db_config_1 = __importDefault(require("../../../config/db.config"));
const error_config_1 = require("../../../config/error.config");
const app_error_1 = __importDefault(require("../../../shared/errors/app.error"));
const notification_service_1 = require("../../../shared/notification/services/notification.service");
const equbber_helper_1 = require("./helpers/equbber.helper");
const payment_helper_1 = require("./helpers/payment.helper");
const sms_service_1 = __importDefault(require("../../../shared/sms/services/sms.service"));
exports.getPayments = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const page = Number(query._page) || 1;
    const limit = Number(query._limit) || 10;
    const skip = Number((page - 1) * limit);
    const filter = req.filters;
    const sortOrder = req.sortOrder;
    const filterWithPicture = Object.assign(Object.assign({}, filter), { picture: {
            not: null,
        } });
    const [payments, total] = yield Promise.all([
        db_config_1.default.payment.findMany({
            //@ts-ignore
            where: filterWithPicture,
            take: limit,
            skip,
            include: {
                equb: {
                    select: {
                        name: true,
                    },
                },
                equbber: {
                    include: {
                        users: {
                            include: {
                                user: {
                                    select: {
                                        fullName: true,
                                    },
                                },
                            },
                        },
                    },
                },
                equberRequests: {
                    include: {
                        users: {
                            include: {
                                user: {
                                    select: {
                                        fullName: true,
                                    },
                                },
                            },
                        },
                    },
                },
                user: true,
            },
            orderBy: sortOrder,
        }),
        db_config_1.default.payment.count({
            //@ts-ignore
            where: filterWithPicture,
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
exports.getExportPayments = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const filter = req.filters;
    const sortOrder = req.sortOrder;
    const filterWithPicture = Object.assign(Object.assign({}, filter), { picture: {
            not: null,
        } });
    const [payments, total] = yield Promise.all([
        db_config_1.default.payment.findMany({
            //@ts-ignore
            where: filterWithPicture,
            include: {
                equb: {
                    select: {
                        name: true,
                    },
                },
                equbber: {
                    include: {
                        users: {
                            include: {
                                user: {
                                    select: {
                                        fullName: true,
                                    },
                                },
                            },
                        },
                    },
                },
                equberRequests: {
                    include: {
                        users: {
                            include: {
                                user: {
                                    select: {
                                        fullName: true,
                                    },
                                },
                            },
                        },
                    },
                },
                user: true,
            },
            orderBy: sortOrder,
        }),
        db_config_1.default.payment.count({
            //@ts-ignore
            where: filterWithPicture,
        }),
    ]);
    res.status(200).json({
        status: "success",
        data: {
            payments,
            meta: {
                total,
            },
        },
    });
}));
exports.getPayment = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const payment = yield db_config_1.default.payment.findUnique({
        where: {
            id: req.params.id,
        },
    });
    if (!payment) {
        return next(new app_error_1.default(`Payment with ID ${req.params.id} does not exist`, 400));
    }
    res.status(200).json({
        status: "success",
        data: {
            payment,
        },
    });
}));
exports.approvePayment = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const { approved } = req.body;
    console.log("approving payment");
    const payment = yield db_config_1.default.payment.findUnique({
        where: { id: req.params.id },
        include: {
            equbber: {
                include: {
                    users: {
                        include: {
                            user: true,
                        },
                    },
                    equb: {
                        include: {
                            equbCategory: true,
                        },
                    },
                },
            },
        },
    });
    if (!payment) {
        return next(new app_error_1.default(`Payment with ID ${req.params.id} does not exist`, 400));
    }
    console.log("Approved payment", payment);
    if (payment.approved) {
        return next(new app_error_1.default(`This payment has been approved.`, 400));
    }
    if (payment.type === "registering") {
        console.log("registering equb");
        const equberRequests = (yield db_config_1.default.equberRequest.findMany({
            where: {
                payments: {
                    some: {
                        id: payment.id,
                    },
                },
            },
            include: {
                equb: true,
                users: { include: { user: true, payments: true } },
                payments: true,
            },
        }));
        if (!equberRequests) {
            return next(new app_error_1.default(`No Equb Request found with this payment ID ${req.params.id}.`, 400));
        }
        const equberRequest = equberRequests.find((request) => request.payments.some((p) => p.id === payment.id));
        const equbName = (_b = (_a = equberRequest === null || equberRequest === void 0 ? void 0 : equberRequest.equb) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : "the Equb";
        console.log("equbName", equbName);
        console.log("equberRequest", equberRequest);
        if (approved === "no") {
            yield (0, equbber_helper_1.deleteEquberRequests)(equberRequests);
            yield db_config_1.default.payment.delete({ where: { id: payment.id } });
            const user = yield db_config_1.default.user.findUnique({
                where: { id: payment.userId },
                include: { deviceTokens: true },
            });
            const tokens = user === null || user === void 0 ? void 0 : user.deviceTokens.map((token) => token.token);
            console.log("tokens");
            console.log(tokens);
            // @ts-ignore
            yield notification_service_1.PushNotification.getInstance().sendNotification("Hagerigna Equb", `Your request to join ${equbName} was declined by Admin.`, tokens);
            //send SMS
            yield sms_service_1.default.sendSms(user === null || user === void 0 ? void 0 : user.phoneNumber, `Your request to join ${equbName} was declined by Admin.`);
            // Create Notification
            yield db_config_1.default.notification.create({
                data: {
                    title: "Request Declined",
                    body: `Your request to join ${equbName} was declined by Admin.`,
                    userId: payment.userId,
                },
            });
            // const equbs = await prisma.equb.findUnique({
            //   where: { id: payment.equbId! },
            // });
            // await prisma.notification.create({
            //   data: {
            //     title: "Hagerigna Equb",
            //     body: `Your request to join equb is declined by Admin.`,
            //     userId: `${payment.userId}`,
            //   },
            // });
        }
        if (approved === "yes") {
            yield db_config_1.default.payment.update({
                where: { id: payment.id },
                data: {
                    approved: true,
                    staffId: (_c = req.staff) === null || _c === void 0 ? void 0 : _c.id,
                },
            });
            console.log("userId:", payment.userId);
            console.log("equbId:", payment.equbId);
            yield db_config_1.default.user.update({
                where: { id: payment.userId },
                data: {
                    joinedEqubs: {
                        connect: {
                            id: payment.equbId,
                        },
                    },
                },
            });
            yield (0, equbber_helper_1.createEqubers)(equberRequests);
            yield (0, equbber_helper_1.deleteEquberRequestsOnly)(equberRequests);
            // finance point
            // await updateEquberFinancePoints(payment.equberId!, payment.id);
            // await prisma.equberRequest.delete({
            //   where: { id: payment.equberRequestId! },
            // });
            const user = yield db_config_1.default.user.findUnique({
                where: { id: payment.userId },
                include: { deviceTokens: true, joinedEqubs: true },
            });
            const equb = user === null || user === void 0 ? void 0 : user.joinedEqubs.find((eq) => eq.id === payment.equbId);
            const equbName = (equb === null || equb === void 0 ? void 0 : equb.name) || "the Equb";
            const tokens = (user === null || user === void 0 ? void 0 : user.deviceTokens.map((token) => token.token)) || [];
            console.log("Notification tokens:", tokens);
            // @ts-ignore
            yield notification_service_1.PushNotification.getInstance().sendNotification("Hagerigna Equb", `Your request to join ${equbName} has been approved by Admin.`, tokens);
            //send SMS
            yield sms_service_1.default.sendSms(user === null || user === void 0 ? void 0 : user.phoneNumber, `Your request to join ${equbName} has been approved by Admin.`);
            yield db_config_1.default.notification.create({
                data: {
                    title: "Hagerigna Equb",
                    body: `Your request to join ${equbName} has been approved by Admin.`,
                    userId: payment.userId,
                },
            });
        }
        return res.status(200).json({
            status: "success",
            data: {
                payment,
            },
        });
    }
    if (payment.type === "equb") {
        console.log("equb.....");
        const equb = yield db_config_1.default.equb.findUnique({
            where: { id: payment.equbId },
        });
        const equbName = (_d = equb === null || equb === void 0 ? void 0 : equb.name) !== null && _d !== void 0 ? _d : "the Equb";
        if (approved === "no") {
            // await deleteEquberRequests(equberRequests)
            yield db_config_1.default.payment.delete({ where: { id: payment.id } });
            const user = yield db_config_1.default.user.findUnique({
                where: { id: payment.userId },
                include: { deviceTokens: true, joinedEqubs: true },
            });
            const tokens = user === null || user === void 0 ? void 0 : user.deviceTokens.map((token) => token.token);
            console.log("tokens");
            console.log(tokens);
            // @ts-ignore
            yield notification_service_1.PushNotification.getInstance().sendNotification("Hagerigna Equb", `Your payment for ${equbName} was declined by Admin.`, tokens);
            //send SMS
            yield sms_service_1.default.sendSms(user === null || user === void 0 ? void 0 : user.phoneNumber, `Your payment for ${equbName} was declined by Admin.`);
            // Create Notification
            yield db_config_1.default.notification.create({
                data: {
                    title: "Payment Declined",
                    body: `Your payment for ${equbName} was declined by Admin.`,
                    userId: payment.userId,
                },
            });
        }
        if (approved === "yes") {
            const updatedPayment = yield db_config_1.default.payment.update({
                where: { id: payment.id },
                data: {
                    approved: true,
                    staffId: (_e = req.staff) === null || _e === void 0 ? void 0 : _e.id,
                },
                include: {
                    equberUserPayments: true,
                    equb: true,
                    user: { include: { equberUsers: true } },
                },
            });
            yield (0, payment_helper_1.approveEquberPayments)(updatedPayment.equberUserPayments);
            const user = yield db_config_1.default.user.findUnique({
                where: { id: payment.userId },
                include: { deviceTokens: true },
            });
            const tokens = user === null || user === void 0 ? void 0 : user.deviceTokens.map((token) => token.token);
            console.log("tokens");
            console.log(tokens);
            // @ts-ignore
            // Send Push Notification
            yield notification_service_1.PushNotification.getInstance().sendNotification("Hagerigna Equb", `Your payment for ${(_f = updatedPayment.equb) === null || _f === void 0 ? void 0 : _f.name} was approved by Admin.`, tokens);
            //send SMS
            yield sms_service_1.default.sendSms(user === null || user === void 0 ? void 0 : user.phoneNumber, `Your payment for ${(_g = updatedPayment.equb) === null || _g === void 0 ? void 0 : _g.name} was approved by Admin.`);
            // Create Notification
            yield db_config_1.default.notification.create({
                data: {
                    title: "Payment Approved",
                    body: `Your payment for ${(_h = updatedPayment.equb) === null || _h === void 0 ? void 0 : _h.name} was approved by Admin.`,
                    userId: payment.userId,
                },
            });
        }
        return res.status(200).json({
            status: "success",
            data: {
                payment,
            },
        });
    }
}));
exports.getPendingPayments = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const payments = yield db_config_1.default.payment.findMany({
        where: {
            approved: false,
        },
    });
    const pendingPaymentsCount = yield db_config_1.default.payment.count({
        where: {
            approved: false,
            picture: {
                not: null,
            },
        },
    });
    if (!payments || payments.length === 0) {
        return next(new app_error_1.default(`No pending payments found`, 404));
    }
    res.status(200).json({
        status: "success",
        data: {
            // payments,
            count: pendingPaymentsCount,
        },
    });
}));
