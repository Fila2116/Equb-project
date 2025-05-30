"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const html_1 = require("@react-email/html");
const button_1 = require("@react-email/button");
const container_1 = require("@react-email/container");
const section_1 = require("@react-email/section");
const text_1 = require("@react-email/text");
const hr_1 = require("@react-email/hr");
const ApprovalEmail = ({ fullName }) => {
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(html_1.Html, null,
            react_1.default.createElement(container_1.Container, null,
                react_1.default.createElement(section_1.Section, null,
                    react_1.default.createElement(text_1.Text, null,
                        "Welcome ",
                        fullName,
                        ", Thank you for registering!"),
                    react_1.default.createElement(hr_1.Hr, null),
                    react_1.default.createElement(text_1.Text, null, " Your account on hagerigna app is aproved."),
                    react_1.default.createElement(hr_1.Hr, null)),
                react_1.default.createElement(section_1.Section, null,
                    react_1.default.createElement(text_1.Text, null,
                        "If you encounter any issues or have any questions, please feel free to reach out to our support team at  ",
                        react_1.default.createElement(button_1.Button, { href: "mailto:support@hagerignaequb.com", style: { color: "#01890d" } }, "support@hagerignaequb.com"),
                        "."))))));
};
exports.default = ApprovalEmail;
