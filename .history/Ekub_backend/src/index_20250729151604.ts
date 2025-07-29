import express, { NextFunction, Request, Response } from "express";
import http from "http";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import consola from "consola";
import path from "path";
import { cleanEnv, port, str } from "envalid";
import "dotenv/config";
import "reflect-metadata";
import fs from "fs";
import winston from "winston";

import { errorController } from "./app/config/error.config";
import AppError from "./app/shared/errors/app.error";

/*User Routes */

import testRouter from "./app/routes/test.route";
import userAuthRouter from "./app/routes/user/auth/user-auth.route";
import userProfileRouter from "./app/routes/user/profile/user-profile.route";
import deviceTokenRouter from "./app/routes/user/device-token/device-token.route";
import userEqubTypeRouter from "./app/routes/user/equb/equb-type.route";
import userEqubCategoryRouter from "./app/routes/user/equb/equb-category.route";
import userEqubRouter from "./app/routes/user/equb/equb.route";
import userBannerRouter from "./app/routes/user/banner/banner.route";
import userPaymentRouter from "./app/routes/user/payment/payment.route";
import UserNotifications from "./app/routes/user/notification/notification.route";
import reportDataRouter from "./app/routes/user/report/reportData.route";

/*Admin Routes */

import branchRouter from "./app/routes/admin/branch/branch.route";
import companyProfileRouter from "./app/routes/admin/companyProfile/companyProfile.route";

import staffAuthRouter from "./app/routes/admin/auth/staff-auth.route";
import roleRouter from "./app/routes/admin/role/role.route";
import permissionRouter from "./app/routes/admin/permission/permission.route";
import staffRouter from "./app/routes/admin/staff/staff.route";
import userRouter from "./app/routes/admin/user/user.route";
import bankRouter from "./app/routes/admin/bank/bank.route";
import companyBankRouter from "./app/routes/admin/bank/bank-account.route";
import equbRouter from "./app/routes/admin/equb/equb.route";
import equbTypeRouter from "./app/routes/admin/equb/equb-type.route";
import equbCategoryRouter from "./app/routes/admin/equb/equb-category.route";
import bannerRouter from "./app/routes/admin/banner/banner.route";
import dashboardRouter from "./app/routes/admin/dashboard/dashboard.route";
import paymentRouter from "./app/routes/admin/payment/payment.route";
import settingRouter from "./app/routes/admin/setting/setting.route";
import serverTimeRouter from "./app/routes/server-time.route";
import AdminReport from "./app/routes/admin/report/reportData.route";
import smsRouter from "./app/routes/admin/sms/sms.route";
import braningRoute from "./app/routes/admin/setting/branding.route";

import "./app/schedules/draw-lottery.job";
import "./app/schedules/sendMessageToInactiveUser.job";
// import "./app/schedules/notifyBeforeLottery";
// import './app/schedules/equb-winner.notify'
// import './app/schedules/equb-lottery-notify.job'
// import './app/schedules/banner-due-notify.job'
// import './app/schedules/test'
import { WebSocketService } from "./app/shared/web-socket/services/web-socket.service";

const env = cleanEnv(process.env, {
  PORT: port(),
  NODE_ENV: str(),
});

/**
 * Connect to database
 */

const app = express();
const httpServer = http.createServer(app);
WebSocketService.getInstance(httpServer);

/**
 * Global Middlewares
 */

if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
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
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(express.static(path.join(__dirname, "../public")));

/**
 * REST API Route Middleware
 */
// User routes
app.use("/api/v1/test", testRouter);
app.use("/api/v1/server-time", serverTimeRouter);
app.use("/api/v1/user/auth", userAuthRouter);
app.use("/api/v1/user/profile", userProfileRouter);
app.use("/api/v1/user/device-token", deviceTokenRouter);
app.use("/api/v1/user/equb", userEqubRouter);
app.use("/api/v1/user/equb-type", userEqubTypeRouter);
app.use("/api/v1/user/equb-category", userEqubCategoryRouter);
app.use("/api/v1/user/banner", userBannerRouter);
app.use("/api/v1/user/payment", userPaymentRouter);
app.use("/api/v1/user/notification", UserNotifications);
app.use("/api/v1/user/report", reportDataRouter);
app.use("/api/v1/setting", settingRouter);

//Admin routes
app.use("/api/v1/staff/auth", staffAuthRouter);
app.use("/api/v1/role", roleRouter);
app.use("/api/v1/permission", permissionRouter);
app.use("/api/v1/branch", branchRouter);
app.use("/api/v1/companyProfile", companyProfileRouter);
app.use("/api/v1/staff", staffRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/bank", bankRouter);
app.use("/api/v1/company-bank", companyBankRouter);
app.use("/api/v1/equbs", equbRouter);
app.use("/api/v1/equb/type", equbTypeRouter);
app.use("/api/v1/equb/category", equbCategoryRouter);
app.use("/api/v1/banner", bannerRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/payment", paymentRouter);
app.use("/api/v1/setting", settingRouter);
app.use("/api/v1/report", AdminReport);
app.use("api/v1/bulksms", smsRouter);
app.use("/api/v1/branding-config", braningRoute);
/**
 * Non existing url middleware
 */

app.use("*", (req: Request, res: Response, next: NextFunction) => {
  return next(
    new AppError(`Can't find ${req.originalUrl} on the server!`, 404)
  );
});

/**
 * Error middleware controller
 */
app.use(errorController);

/**
 * Start the server
 */
const PORT = env.PORT;
httpServer.listen(PORT, () => {
  consola.success(`Server running on port ${PORT}`);
});
