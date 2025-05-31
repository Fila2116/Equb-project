"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PRIVATE_KEY_IN_PEM = exports.devKey = exports.TEST_BASE_URL = exports.PRODUCTION_BASE_URL = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const keyPath = path_1.default.join(__dirname, "../../../../../hageregna-private.pem");
console.log(keyPath);
exports.PRODUCTION_BASE_URL = "https://services.santimpay.com/api/v1/gateway";
exports.TEST_BASE_URL = "https://testnet.santimpay.com/api/v1/gateway";
// export const TEST_BASE_URL = "http://localhost:16000/api/v1/gateway";
exports.devKey = process.env.SANTIMPAY_PRIVATE_KEY;
// Read the PEM files
const prodKey = fs_1.default.readFileSync(keyPath, "utf8");
console.log("prodKey: ", prodKey);
// export const PRIVATE_KEY_IN_PEM = devKey;
exports.PRIVATE_KEY_IN_PEM = process.env.NODE_ENV === "development" ? prodKey : exports.devKey;
console.log("devKey: ", exports.devKey);
console.log("process.env.NODE_ENV: ", process.env.NODE_ENV);
console.log("PRIVATE_KEY_IN_PEM");
console.log(exports.PRIVATE_KEY_IN_PEM);
