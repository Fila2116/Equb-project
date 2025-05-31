"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const nodemailer_1 = __importDefault(require("nodemailer"));
const app_error_1 = __importDefault(require("../../errors/app.error"));
const envalid_1 = require("envalid");
const components_1 = require("@react-email/components");
const user_approved_template_1 = __importDefault(require("../templates/user-approved-template"));
const sendEqubNotification_template_1 = __importDefault(require("../templates/sendEqubNotification.template"));
const staff_welcome_template_1 = __importDefault(require("../templates/staff-welcome.template"));
const react_1 = __importDefault(require("react"));
const otp_mail_template_1 = __importStar(require("../templates/otp-mail.template"));
const env = (0, envalid_1.cleanEnv)(process.env, {
    EMAIL_USERNAME: (0, envalid_1.email)(),
    EMAIL_PASSWORD: (0, envalid_1.str)(),
});
// let transporter = nodemailer.createTransport({
//   host: "mail.metahudelivery.com",
//   port: 465,
//   secure: true, // true for 465, false for other ports
//   auth: {
//     user: process.env.EMAIL_USERNAME, // generated ethereal user
//     pass: process.env.EMAIL_PASSWORD, // generated ethereal password
//   },
// })
let transporter = nodemailer_1.default.createTransport({
    host: "mail.hageregnaequb.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: env.EMAIL_USERNAME, // generated ethereal user
        pass: env.EMAIL_PASSWORD, // generated ethereal password
    },
});
function sendUserApproval(to, fullName, password) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            const html = (0, components_1.render)(react_1.default.createElement(user_approved_template_1.default, { fullName: fullName }));
            const msg = {
                from: `"Hagerigna equb" <${env.EMAIL_USERNAME}>`, // sender address
                to: to, // list of receivers
                subject: "Welcome", // Subject line
                text: `text msg`, // plain text body
                html: html, // html body
            };
            resolve(yield transporter.sendMail(msg));
        }
        catch (err) {
            reject(new app_error_1.default("Something wrong sending the email", 500));
        }
    }));
}
function sendStaffWelcome(to, fullName, password) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            const html = (0, components_1.render)(react_1.default.createElement(staff_welcome_template_1.default, { fullName: fullName, password: password }));
            const msg = {
                from: `"Hagerigna equb" <${env.EMAIL_USERNAME}>`, // sender address
                to: to, // list of receivers
                subject: "Welcome", // Subject line
                text: `text msg`, // plain text body
                html: html, // html body
            };
            resolve(yield transporter.sendMail(msg));
        }
        catch (err) {
            // reject(new AppError("Something wrong sending the email", 500));
            console.log("Error sending the email");
            console.log(err);
        }
    }));
}
function sendOTPMail(to, fullName, otp) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            const html = (0, components_1.render)(react_1.default.createElement(otp_mail_template_1.default, { fullName: fullName, otp: otp }));
            const msg = {
                from: `"Hagerigna Equb" <${env.EMAIL_USERNAME}>`,
                to: to,
                subject: "Your OTP for Password Reset",
                text: `Hello ${fullName}, your OTP for password reset is ${otp}.`,
                html: html,
            };
            resolve(yield transporter.sendMail(msg));
        }
        catch (err) {
            reject(new app_error_1.default("Something wrong sending the email", 500));
            console.log("Error sending the email");
            console.log(err);
        }
    }));
}
function sendOTPMailRegister(to, otp) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            const html = (0, components_1.render)(react_1.default.createElement(otp_mail_template_1.OTPVerifyRegister, { otp: otp }));
            const msg = {
                from: `"Hagerigna Equb" <${env.EMAIL_USERNAME}>`,
                to: to,
                subject: "Your OTP Verification",
                text: `Hello, your OTP is ${otp}.`,
                html: html,
            };
            resolve(yield transporter.sendMail(msg));
        }
        catch (err) {
            reject(new app_error_1.default("Something wrong sending the email", 500));
            console.log("Error sending the email");
            console.log(err);
        }
    }));
}
function sendEqubNotification(to, time, equbName) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            const html = (0, components_1.render)(react_1.default.createElement(sendEqubNotification_template_1.default, { time: time, equbName: equbName }));
            const msg = {
                from: `"Hagerigna Equb" <${env.EMAIL_USERNAME}>`,
                to: to,
                subject: "Winner Announcement Coming Soon!",
                text: `Hello, we want to inform you that the winner for the Equb "${equbName}" will be announced soon at ${time}. Please stay tuned for further updates.`,
                html: html,
            };
            resolve(yield transporter.sendMail(msg));
        }
        catch (err) {
            reject(new app_error_1.default("Something wrong sending the email", 500));
            console.log("Error sending the email");
            console.log(err);
        }
    }));
}
//Send Email To Admin Page
function sendAdminLoginAlertMail(adminEmail, staff, city, state, country) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>🚨 User Failed Login Attempts Report</h2>
          <p>The user below has failed to log in more than five times in a row:</p>

          <h3>User Details:</h3>
          <ul>
            <li><strong>Name:</strong> ${staff.fullName}</li>
            <li><strong>Email:</strong> ${staff.email}</li>
          </ul>

          <p><strong>Failed Attempts:</strong> ${staff.FailureCount}</p>
          <p><strong>Location:</strong> ${city}, ${state}, ${country}</p>

          <p>The account is temporarily <strong>locked for 5 minutes</strong>.</p>

          <p>Please investigate if necessary.</p>
          <br />
          <p>— System Notification Service</p>
        </div>
      `;
            const msg = {
                from: `"Hagerigna Equb" <${env.EMAIL_USERNAME}>`,
                to: adminEmail,
                subject: "⚠️ Alert: User Failed Login Attempts",
                text: `User ${staff.fullName} failed to log in ${staff.FailureCount} times. Location: ${city}, ${country}`,
                html,
            };
            resolve(yield transporter.sendMail(msg));
        }
        catch (err) {
            console.error("Error sending admin alert email:", err);
            reject(new app_error_1.default("Failed to send admin login alert email", 500));
        }
    }));
}
//Send Email To Admin Page
function sendAdminLoginAlertMailWithOutLocation(adminEmail, staff) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>🚨 User Failed Login Attempts Report</h2>
          <p>The user below has failed to log in more than five times in a row:</p>

          <h3>User Details:</h3>
          <ul>
            <li><strong>Name:</strong> ${staff.fullName}</li>
            <li><strong>Email:</strong> ${staff.email}</li>
          </ul>

          <p><strong>Failed Attempts:</strong> ${staff.FailureCount}</p>

          <p>The account is temporarily <strong>locked for 5 minutes</strong>.</p>

          <p>Please investigate if necessary.</p>
          <br />
          <p>— System Notification Service</p>
        </div>
      `;
            const msg = {
                from: `"Hagerigna Equb" <${env.EMAIL_USERNAME}>`,
                to: adminEmail,
                subject: "⚠️ Alert: User Failed Login Attempts",
                text: `User ${staff.fullName} failed to log in ${staff.FailureCount} times.`,
                html,
            };
            resolve(yield transporter.sendMail(msg));
        }
        catch (err) {
            console.error("Error sending admin alert email:", err);
            reject(new app_error_1.default("Failed to send admin login alert email", 500));
        }
    }));
}
const MailService = {
    sendUserApproval,
    sendStaffWelcome,
    sendOTPMail,
    sendOTPMailRegister,
    sendEqubNotification,
    sendAdminLoginAlertMail,
    sendAdminLoginAlertMailWithOutLocation,
};
exports.default = MailService;
