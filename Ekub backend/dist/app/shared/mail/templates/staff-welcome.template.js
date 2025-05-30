"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const html_1 = require("@react-email/html");
const heading_1 = require("@react-email/heading");
const button_1 = require("@react-email/button");
const container_1 = require("@react-email/container");
const section_1 = require("@react-email/section");
const text_1 = require("@react-email/text");
const hr_1 = require("@react-email/hr");
const StaffWelcome = ({ fullName, password }) => {
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(html_1.Html, null,
            react_1.default.createElement(container_1.Container, null,
                react_1.default.createElement(section_1.Section, null,
                    react_1.default.createElement(heading_1.Heading, { as: 'h1', style: { color: '#40507a', fontWeight: 'bolder' } }, "Welcome to Hagerigna Equb!"),
                    react_1.default.createElement(hr_1.Hr, null),
                    react_1.default.createElement(text_1.Text, null,
                        " Hey ",
                        fullName,
                        "."),
                    react_1.default.createElement(hr_1.Hr, null),
                    react_1.default.createElement(text_1.Text, null, "Here is your password for your newly created staff account."),
                    react_1.default.createElement(hr_1.Hr, null),
                    react_1.default.createElement(text_1.Text, { style: { padding: '1rem 2rem', background: '#40507a', color: 'white', width: 'fit-content' } }, password)),
                react_1.default.createElement(section_1.Section, null,
                    react_1.default.createElement(text_1.Text, null,
                        "If you encounter any issues or have any questions, please feel free to reach out to our support team at  ",
                        react_1.default.createElement(button_1.Button, { href: "mailto:support@hagerignaequb.com", style: { color: "#01890d" } }, "support@hagerignaequb.com"),
                        "."))))));
};
exports.default = StaffWelcome;
