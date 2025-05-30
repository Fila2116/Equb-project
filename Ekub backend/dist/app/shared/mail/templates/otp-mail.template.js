"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OTPVerifyRegister = void 0;
const react_1 = __importDefault(require("react"));
const html_1 = require("@react-email/html");
const heading_1 = require("@react-email/heading");
const button_1 = require("@react-email/button");
const container_1 = require("@react-email/container");
const section_1 = require("@react-email/section");
const text_1 = require("@react-email/text");
const hr_1 = require("@react-email/hr");
const OTPVerify = ({ fullName, otp }) => {
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(html_1.Html, null,
            react_1.default.createElement(container_1.Container, null,
                react_1.default.createElement(section_1.Section, null,
                    react_1.default.createElement(heading_1.Heading, { as: "h1", style: { color: "#40507a", fontWeight: "bolder" } }, "Password Reset Request - Hagerigna Equb"),
                    react_1.default.createElement(hr_1.Hr, null),
                    react_1.default.createElement(text_1.Text, null,
                        "Hey ",
                        fullName,
                        ","),
                    react_1.default.createElement(hr_1.Hr, null),
                    react_1.default.createElement(text_1.Text, null, "We received a request to reset your password."),
                    react_1.default.createElement(text_1.Text, null, "Use the following OTP to proceed with resetting your password:"),
                    react_1.default.createElement(hr_1.Hr, null),
                    react_1.default.createElement(text_1.Text, { style: {
                            padding: "1rem 2rem",
                            background: "#40507a",
                            color: "white",
                            width: "fit-content",
                        } }, otp),
                    react_1.default.createElement("p", null, "Please do not share it with anyone."),
                    react_1.default.createElement("p", null, "If you did not request a password reset, you can safely ignore this email."),
                    react_1.default.createElement("p", null, "Thank you for using Hagerigna Equb!")),
                react_1.default.createElement(section_1.Section, null,
                    react_1.default.createElement(text_1.Text, null,
                        "If you encounter any issues or have any questions, feel free to reach out to our support team at",
                        react_1.default.createElement(button_1.Button, { href: "mailto:support@hagerignaequb.com", style: { color: "#01890d", marginLeft: "0.3rem" } }, "support@hagerignaequb.com"),
                        "."))))));
};
const OTPVerifyRegister = ({ otp, }) => {
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(html_1.Html, null,
            react_1.default.createElement(container_1.Container, null,
                react_1.default.createElement(section_1.Section, null,
                    react_1.default.createElement(heading_1.Heading, { as: "h1", style: { color: "#40507a", fontWeight: "bolder" } }, "Welcome to Hagerigna Equb!"),
                    react_1.default.createElement(hr_1.Hr, null),
                    react_1.default.createElement(hr_1.Hr, null),
                    react_1.default.createElement(text_1.Text, null, "Use the following OTP to verify your account:"),
                    react_1.default.createElement(hr_1.Hr, null),
                    react_1.default.createElement(text_1.Text, { style: {
                            padding: "1rem 2rem",
                            background: "#40507a",
                            color: "white",
                            width: "fit-content",
                        } }, otp),
                    react_1.default.createElement("p", null, "This OTP is valid for a limited time only. Please do not share it with anyone."),
                    react_1.default.createElement("p", null, "Thank you for choosing our service!")),
                react_1.default.createElement(section_1.Section, null,
                    react_1.default.createElement(text_1.Text, null,
                        "If you encounter any issues or have any questions, please feel free to reach out to our support team at",
                        react_1.default.createElement(button_1.Button, { href: "mailto:support@hagerignaequb.com", style: { color: "#01890d" } }, "support@hagerignaequb.com"),
                        "."))))));
};
exports.OTPVerifyRegister = OTPVerifyRegister;
exports.default = OTPVerify;
