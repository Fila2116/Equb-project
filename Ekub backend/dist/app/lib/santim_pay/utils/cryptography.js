"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signES256 = exports.sign = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function sign(payload, privateKey, algorithm) {
    return jsonwebtoken_1.default.sign(JSON.stringify(payload), privateKey, {
        algorithm,
    });
}
exports.sign = sign;
function signES256(payload, privateKey) {
    console.log("payload", { payload, privateKey });
    return sign(payload, privateKey, "ES256");
}
exports.signES256 = signES256;
