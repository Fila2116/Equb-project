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
exports.paymentWebhook = exports.paymentNotify = exports.getTransactionHistory = exports.confirmPayment = exports.uploadImage = void 0;
const db_config_1 = __importDefault(require("../../../config/db.config"));
const error_config_1 = require("../../../config/error.config");
const app_error_1 = __importDefault(require("../../../shared/errors/app.error"));
const multer_config_1 = require("../../../config/multer.config");
const equbber_helper_1 = require("../../admin/payment/helpers/equbber.helper");
const payment_helper_1 = require("../../admin/payment/helpers/payment.helper");
const notification_service_1 = require("../../../shared/notification/services/notification.service");
const upload = (0, multer_config_1.multerConfig)(multer_config_1.RESOURCES.PAYMENT, multer_config_1.DESTINANTIONS.IMAGE.PAYMENT, multer_config_1.FILTERS.IMAGE);
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
exports.confirmPayment = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("got here");
    const { fileName, reference, companyBankAccountId } = req.body;
    console.log(`fileName is ${fileName}`);
    const payment = yield db_config_1.default.payment.update({
        where: { id: req.params.id },
        data: {
            picture: fileName,
            reference: reference ? reference : "",
            companyBankAccountId: companyBankAccountId,
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
exports.getTransactionHistory = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const query = req.query;
    const approved = query.approved
        ? query.approved === "true"
            ? true
            : false
        : true;
    console.log("req.user?.id", (_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
    console.log("query", query);
    let filter = {
        userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id,
        approved,
    };
    if (query.equb) {
        filter = Object.assign(Object.assign({}, filter), { equbId: query.equb });
    }
    if (query.paymentMethod) {
        filter = Object.assign(Object.assign({}, filter), { paymentMethod: query.paymentMethod });
    }
    // Fetching payments where type is either "equb" or "registering"
    const paymentsMade = yield db_config_1.default.payment.findMany({
        where: Object.assign(Object.assign({}, filter), { type: {
                in: ["equb", "registering"],
            } }),
        select: {
            type: true,
            id: true,
            amount: true,
            paymentMethod: true,
            equb: {
                select: {
                    id: true,
                    name: true,
                },
            },
            createdAt: true,
        },
    });
    // Fetching payments where type is "lottery"
    const paymentsReceived = yield db_config_1.default.payment.findMany({
        where: Object.assign(Object.assign({}, filter), { type: "lottery", equbberUser: {
                userId: (_c = req.user) === null || _c === void 0 ? void 0 : _c.id,
            } }),
        select: {
            id: true,
            type: true,
            amount: true,
            paymentMethod: true,
            equb: {
                select: {
                    id: true,
                    name: true,
                },
            },
            equbberUser: {
                select: {
                    calculatedPaidAmount: true,
                },
            },
            createdAt: true,
        },
    });
    // Calculate total amounts for both payments
    const totalPaid = paymentsMade.reduce((sum, payment) => sum + payment.amount, 0);
    const totalReceived = paymentsReceived.reduce((sum, payment) => { var _a; return sum + (((_a = payment.equbberUser) === null || _a === void 0 ? void 0 : _a.calculatedPaidAmount) || 0); }, 0);
    // Respond with the data
    res.status(200).json({
        status: "success",
        data: {
            paymentsMade,
            paymentsReceived,
            totalPaid,
            totalReceived,
        },
    });
}));
// Notify URL endpoint
exports.paymentNotify = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { transactionId, status } = req.body;
    console.log("paymentNotify");
    // Find the payment record by transactionId
    const payment = yield db_config_1.default.payment.findUnique({
        where: { id: transactionId },
    });
    if (!payment) {
        return next(new app_error_1.default(`Payment with ID ${transactionId} does not exist`, 404));
    }
    // Update the payment status based on the webhook status
    let approved = false;
    if (status === "success") {
        approved = true;
    }
    yield db_config_1.default.payment.update({
        where: { id: transactionId },
        data: { approved },
    });
    res.status(200).json({
        status: "success",
        message: "Payment status updated successfully",
    });
}));
exports.paymentWebhook = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _d, _e, _f, _g, _h, _j, _k;
    const { thirdPartyId, Status, amount, created_at, updated_at } = req.body;
    console.log("Webhook received:", req.body);
    if (!thirdPartyId || !Status) {
        return res.status(400).json({ message: "Invalid webhook data" });
    }
    const payment = yield db_config_1.default.payment.findUnique({
        where: { transactionId: thirdPartyId },
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
        return res.status(404).json({ message: "Payment not found" });
    }
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
        const equbName = (_e = (_d = equberRequest === null || equberRequest === void 0 ? void 0 : equberRequest.equb) === null || _d === void 0 ? void 0 : _d.name) !== null && _e !== void 0 ? _e : "the Equb";
        if (Status === "FAILED") {
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
            yield notification_service_1.PushNotification.getInstance().sendNotification("Hagerigna Equb", `Your request to join ${equbName} was Failed. Please try again`, tokens);
            // Create Notification
            yield db_config_1.default.notification.create({
                data: {
                    title: "Request Declined",
                    body: `Your request to join ${equbName} was Failed. Please try again`,
                    userId: payment.userId,
                },
            });
        }
        if (Status === "COMPLETED") {
            const state = Status === "COMPLETED" ? "active" : "inactive";
            yield db_config_1.default.payment.update({
                where: { id: payment.id },
                data: {
                    state,
                    amount: parseFloat(amount),
                    createdAt: new Date(created_at),
                    updatedAt: new Date(updated_at),
                    picture: "abebe.png",
                    approved: true,
                    staffId: (_f = req.staff) === null || _f === void 0 ? void 0 : _f.id,
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
            yield (0, equbber_helper_1.createEqubers)(equberRequests);
            yield (0, equbber_helper_1.deleteEquberRequestsOnly)(equberRequests);
            const user = yield db_config_1.default.user.findUnique({
                where: { id: payment.userId },
                include: { deviceTokens: true, joinedEqubs: true },
            });
            const equb = user === null || user === void 0 ? void 0 : user.joinedEqubs.find((eq) => eq.id === payment.equbId);
            const equbName = (equb === null || equb === void 0 ? void 0 : equb.name) || "the Equb";
            const tokens = (user === null || user === void 0 ? void 0 : user.deviceTokens.map((token) => token.token)) || [];
            console.log("Notification tokens:", tokens);
            // @ts-ignore
            yield notification_service_1.PushNotification.getInstance().sendNotification("Hagerigna Equb", `Your request to join ${equbName} has been approved after you successfully pay using SantimPay `, tokens);
            yield db_config_1.default.notification.create({
                data: {
                    title: "Hagerigna Equb",
                    body: `Your request to join ${equbName} has been approved after you successfully pay using SantimPay `,
                    userId: payment.userId,
                },
            });
            return res.status(200).json({
                status: "success",
                data: {
                    payment,
                },
            });
        }
    }
    if (payment.type === "equb") {
        const equb = yield db_config_1.default.equb.findUnique({
            where: { id: payment.equbId },
        });
        const equbName = (_g = equb === null || equb === void 0 ? void 0 : equb.name) !== null && _g !== void 0 ? _g : "the Equb";
        if (Status === "FAILED") {
            yield db_config_1.default.payment.delete({ where: { id: payment.id } });
            const user = yield db_config_1.default.user.findUnique({
                where: { id: payment.userId },
                include: { deviceTokens: true, joinedEqubs: true },
            });
            const tokens = user === null || user === void 0 ? void 0 : user.deviceTokens.map((token) => token.token);
            console.log("tokens");
            console.log(tokens);
            // @ts-ignore
            yield notification_service_1.PushNotification.getInstance().sendNotification("Hagerigna Equb", `Your payment for ${equbName} was Failed ,please try again.`, tokens);
            // Create Notification
            yield db_config_1.default.notification.create({
                data: {
                    title: "Payment Declined",
                    body: `Your payment for ${equbName} was Failed ,please try again`,
                    userId: payment.userId,
                },
            });
        }
        if (Status === "COMPLETED") {
            const state = Status === "COMPLETED" ? "active" : "inactive";
            const updatedPayment = yield db_config_1.default.payment.update({
                where: { id: payment.id },
                data: {
                    state,
                    amount: parseFloat(amount),
                    createdAt: new Date(created_at),
                    updatedAt: new Date(updated_at),
                    picture: "abebe.png",
                    approved: true,
                    staffId: (_h = req.staff) === null || _h === void 0 ? void 0 : _h.id,
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
            yield notification_service_1.PushNotification.getInstance().sendNotification("Hagerigna Equb", `Your payment for ${(_j = updatedPayment.equb) === null || _j === void 0 ? void 0 : _j.name} was approved after you pay in santim pay.`, tokens);
            // Create Notification
            yield db_config_1.default.notification.create({
                data: {
                    title: "Payment Approved",
                    body: `Your payment for ${(_k = updatedPayment.equb) === null || _k === void 0 ? void 0 : _k.name} was approved after you pay in santim pay`,
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
})
// // Handle successful payments (e.g., create Equber Request)
// if (state === "active") {
//   await prisma.equberRequest.create({
//     data: {
//       equbId: payment.equbId,
//       payments: { connect: { id: payment.id } },
//       isGruop: false, // or true, depending on your logic
//     },
//   });
// }
// return res.status(200).json({ message: "Webhook processed successfully" });
);
