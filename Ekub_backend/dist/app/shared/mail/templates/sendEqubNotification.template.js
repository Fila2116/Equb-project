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
// Props interface to type-check the data passed into the template
const EqubNotification = ({ equbName, time, }) => {
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(html_1.Html, null,
            react_1.default.createElement(container_1.Container, null,
                react_1.default.createElement(section_1.Section, null,
                    react_1.default.createElement(heading_1.Heading, { as: "h1", style: { color: "#40507a", fontWeight: "bolder" } },
                        "Winner Announcement for \"",
                        equbName,
                        "\" Coming Soon!"),
                    react_1.default.createElement(hr_1.Hr, null),
                    react_1.default.createElement(text_1.Text, null, "Dear Member,"),
                    react_1.default.createElement(hr_1.Hr, null),
                    react_1.default.createElement(text_1.Text, null,
                        "We want to inform you that the winner for the Equb \"",
                        react_1.default.createElement("strong", null, equbName),
                        "\" will be announced soon. The announcement will take place at ",
                        react_1.default.createElement("strong", null, time),
                        "."),
                    react_1.default.createElement(hr_1.Hr, null),
                    react_1.default.createElement(text_1.Text, null, "Stay tuned and be ready for the announcement!")),
                react_1.default.createElement(section_1.Section, null,
                    react_1.default.createElement(text_1.Text, null,
                        "If you have any questions or need assistance, feel free to contact us at",
                        " ",
                        react_1.default.createElement(button_1.Button, { href: "mailto:support@hagerignaequb.com", style: { color: "#01890d" } }, "support@hagerignaequb.com"),
                        "."))))));
};
exports.default = EqubNotification;
