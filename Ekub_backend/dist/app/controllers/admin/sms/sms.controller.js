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
exports.sendBulkSms = void 0;
const error_config_1 = require("../../../config/error.config");
const sms_service_1 = __importDefault(require("../../../shared/sms/services/sms.service"));
exports.sendBulkSms = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // const users = await prisma.user.findMany({
    //   select: {
    //     phoneNumber: true,
    //   },
    // });
    // const phoneNumber = users
    //   .map((user) => user.phoneNumber)
    //   .filter(Boolean) as string[];
    // const message = req.body.message;
    // if (!phoneNumber || !message) {
    //   return res
    //     .status(400)
    //     .json({ error: "phoneNumber and message are required" });
    // }
    const { phoneNumber, message } = req.body;
    const response = yield sms_service_1.default.sendBulkSms(phoneNumber, message);
    res.status(200).json({ success: true, data: response });
}));
