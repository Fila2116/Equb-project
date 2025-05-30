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
exports.deleteNotifications = exports.getNotifications = exports.getNotification = void 0;
const db_config_1 = __importDefault(require("../../../config/db.config"));
const error_config_1 = require("../../../config/error.config");
const dateFormatter_1 = require("../../../utils/dateFormatter");
exports.getNotification = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // const user = await prisma.user.findUnique({
    //   where: {
    //     id: req.params.id,
    //   },
    //   select: {
    //     notifications: true,
    //   },
    // });
    const notification = yield db_config_1.default.notification.findMany({
        where: {
            userId: req.params.id,
        },
        include: {
            user: {
                select: {
                    firstName: true,
                    lastName: true,
                    fullName: true,
                },
            },
            equb: {
                select: { equbType: true, name: true },
            },
        },
    });
    const formattedNotifications = notification.map((notification) => (Object.assign(Object.assign({}, notification), { createdAt: (0, dateFormatter_1.formatDate)(notification.createdAt), updatedAt: (0, dateFormatter_1.formatDate)(notification.updatedAt) })));
    res.status(200).json({
        status: "success",
        data: { notifications: formattedNotifications },
    });
}));
exports.getNotifications = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // const user = await prisma.user.findUnique({
    //   where: {
    //     id: req.params.id,
    //   },
    //   select: {
    //     notifications: true,
    //   },
    // });
    const notification = yield db_config_1.default.notification.findMany();
    res.status(200).json({
        status: "success",
        data: { notification },
    });
}));
exports.deleteNotifications = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const deletedNotification = yield db_config_1.default.notification.delete({
        where: { id: req.params.id },
    });
    res.status(200).json({
        status: "success",
        message: "Notification deleted successfully",
        data: deletedNotification,
    });
}));
