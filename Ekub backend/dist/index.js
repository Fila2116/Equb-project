"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const consola_1 = __importDefault(require("consola"));
const path_1 = __importDefault(require("path"));
const envalid_1 = require("envalid");
require("dotenv/config");
require("reflect-metadata");
const error_config_1 = require("./app/config/error.config");
const app_error_1 = __importDefault(require("./app/shared/errors/app.error"));
/*User Routes */
const test_route_1 = __importDefault(require("./app/routes/test.route"));
const user_auth_route_1 = __importDefault(require("./app/routes/user/auth/user-auth.route"));
const user_profile_route_1 = __importDefault(require("./app/routes/user/profile/user-profile.route"));
const device_token_route_1 = __importDefault(require("./app/routes/user/device-token/device-token.route"));
const equb_type_route_1 = __importDefault(require("./app/routes/user/equb/equb-type.route"));
const equb_category_route_1 = __importDefault(require("./app/routes/user/equb/equb-category.route"));
const equb_route_1 = __importDefault(require("./app/routes/user/equb/equb.route"));
const banner_route_1 = __importDefault(require("./app/routes/user/banner/banner.route"));
const payment_route_1 = __importDefault(require("./app/routes/user/payment/payment.route"));
const notification_route_1 = __importDefault(require("./app/routes/user/notification/notification.route"));
const reportData_route_1 = __importDefault(require("./app/routes/user/report/reportData.route"));
/*Admin Routes */
const branch_route_1 = __importDefault(require("./app/routes/admin/branch/branch.route"));
const companyProfile_route_1 = __importDefault(require("./app/routes/admin/companyProfile/companyProfile.route"));
const staff_auth_route_1 = __importDefault(require("./app/routes/admin/auth/staff-auth.route"));
const role_route_1 = __importDefault(require("./app/routes/admin/role/role.route"));
const permission_route_1 = __importDefault(require("./app/routes/admin/permission/permission.route"));
const staff_route_1 = __importDefault(require("./app/routes/admin/staff/staff.route"));
const user_route_1 = __importDefault(require("./app/routes/admin/user/user.route"));
const bank_route_1 = __importDefault(require("./app/routes/admin/bank/bank.route"));
const bank_account_route_1 = __importDefault(require("./app/routes/admin/bank/bank-account.route"));
const equb_route_2 = __importDefault(require("./app/routes/admin/equb/equb.route"));
const equb_type_route_2 = __importDefault(require("./app/routes/admin/equb/equb-type.route"));
const equb_category_route_2 = __importDefault(require("./app/routes/admin/equb/equb-category.route"));
const banner_route_2 = __importDefault(require("./app/routes/admin/banner/banner.route"));
const dashboard_route_1 = __importDefault(require("./app/routes/admin/dashboard/dashboard.route"));
const payment_route_2 = __importDefault(require("./app/routes/admin/payment/payment.route"));
const setting_route_1 = __importDefault(require("./app/routes/admin/setting/setting.route"));
const server_time_route_1 = __importDefault(require("./app/routes/server-time.route"));
const reportData_route_2 = __importDefault(require("./app/routes/admin/report/reportData.route"));
const sms_route_1 = __importDefault(require("./app/routes/admin/sms/sms.route"));
require("./app/schedules/draw-lottery.job");
require("./app/schedules/sendMessageToInactiveUser.job");
// import "./app/schedules/notifyBeforeLottery";
// import './app/schedules/equb-winner.notify'
// import './app/schedules/equb-lottery-notify.job'
// import './app/schedules/banner-due-notify.job'
// import './app/schedules/test'
const web_socket_service_1 = require("./app/shared/web-socket/services/web-socket.service");
const env = (0, envalid_1.cleanEnv)(process.env, {
    PORT: (0, envalid_1.port)(),
    NODE_ENV: (0, envalid_1.str)(),
});
/**
 * Connect to database
 */
const app = (0, express_1.default)();
const httpServer = http_1.default.createServer(app);
web_socket_service_1.WebSocketService.getInstance(httpServer);
/**
 * Global Middlewares
 */
if (env.NODE_ENV === "development") {
    app.use((0, morgan_1.default)("dev"));
}
// const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
// app.use(morgan('combined', { stream: accessLogStream }));
// const logger = winston.createLogger({
//   level: 'info',
//   format: winston.format.simple(),
//   transports: [
//     new winston.transports.File({ filename: 'console.log' }), // Log to a file
//     // new winston.transports.Console(), // Also log to the console (for local development)
//   ],
// });
// // Replace console.log with winston's logger
// console.log = logger.info.bind(logger);
// console.error = logger.error.bind(logger);
const corsOptions = {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};
app.use((0, cors_1.default)(corsOptions));
app.use((0, compression_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, "../public")));
/**
 * REST API Route Middleware
 */
// User routes
app.use("/api/v1/test", test_route_1.default);
app.use("/api/v1/server-time", server_time_route_1.default);
app.use("/api/v1/user/auth", user_auth_route_1.default);
app.use("/api/v1/user/profile", user_profile_route_1.default);
app.use("/api/v1/user/device-token", device_token_route_1.default);
app.use("/api/v1/user/equb", equb_route_1.default);
app.use("/api/v1/user/equb-type", equb_type_route_1.default);
app.use("/api/v1/user/equb-category", equb_category_route_1.default);
app.use("/api/v1/user/banner", banner_route_1.default);
app.use("/api/v1/user/payment", payment_route_1.default);
app.use("/api/v1/user/notification", notification_route_1.default);
app.use("/api/v1/user/report", reportData_route_1.default);
//Admin routes
app.use("/api/v1/staff/auth", staff_auth_route_1.default);
app.use("/api/v1/role", role_route_1.default);
app.use("/api/v1/permission", permission_route_1.default);
app.use("/api/v1/branch", branch_route_1.default);
app.use("/api/v1/companyProfile", companyProfile_route_1.default);
app.use("/api/v1/staff", staff_route_1.default);
app.use("/api/v1/users", user_route_1.default);
app.use("/api/v1/bank", bank_route_1.default);
app.use("/api/v1/company-bank", bank_account_route_1.default);
app.use("/api/v1/equbs", equb_route_2.default);
app.use("/api/v1/equb/type", equb_type_route_2.default);
app.use("/api/v1/equb/category", equb_category_route_2.default);
app.use("/api/v1/banner", banner_route_2.default);
app.use("/api/v1/dashboard", dashboard_route_1.default);
app.use("/api/v1/payment", payment_route_2.default);
app.use("/api/v1/setting", setting_route_1.default);
app.use("/api/v1/report", reportData_route_2.default);
app.use("api/v1/bulksms", sms_route_1.default);
/**
 * Non existing url middleware
 */
app.use("*", (req, res, next) => {
    return next(new app_error_1.default(`Can't find ${req.originalUrl} on the server!`, 404));
});
/**
 * Error middleware controller
 */
app.use(error_config_1.errorController);
/**
 * Start the server
 */
const PORT = env.PORT;
httpServer.listen(PORT, () => {
    consola_1.default.success(`Server running on port ${PORT}`);
});
