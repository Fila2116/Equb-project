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
const node_schedule_1 = __importDefault(require("node-schedule"));
const db_config_1 = __importDefault(require("../config/db.config"));
const sms_service_1 = __importDefault(require("../shared/sms/services/sms.service"));
// Function to be executed by the scheduler
function notifyAdminForDueBanner() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('Fetching due banners...');
            const notificatioinSetting = yield db_config_1.default.setting.findFirst({ where: { name: 'notificationTime', state: 'active' } });
            const notificationTime = (notificatioinSetting === null || notificatioinSetting === void 0 ? void 0 : notificatioinSetting.numericValue) || 30;
            const now = new Date();
            const dueDateTime = new Date(now.getTime() + notificationTime * 60 * 1000);
            const dueBanners = yield db_config_1.default.banner.findMany({
                where: {
                    validUntil: {
                        lt: dueDateTime,
                    },
                }
            });
            const superAdmins = yield db_config_1.default.staff.findMany({
                where: {
                    role: {
                        name: 'Super Admin'
                    }
                }
            });
            console.log('superAdmins');
            console.log(superAdmins);
            for (const banner of dueBanners) {
                for (const admin of superAdmins) {
                    yield sms_service_1.default.sendSms(admin.phoneNumber, `Banner ${banner.name} will end from tommorow on`);
                }
            }
        }
        catch (error) {
            console.error('Error drawing lottery:', error);
        }
    });
}
// Schedule a task to run every minute
const job = node_schedule_1.default.scheduleJob('* * * * *', notifyAdminForDueBanner);
module.exports = job;
