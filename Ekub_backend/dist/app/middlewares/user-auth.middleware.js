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
exports.restrictUser = exports.verifyUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const app_error_1 = __importDefault(require("../shared/errors/app.error"));
const util_1 = require("util");
const envalid_1 = require("envalid");
const env = (0, envalid_1.cleanEnv)(process.env, {
    JWT_ACCESS_SECRET_KEY: (0, envalid_1.str)(),
    JWT_ACCESS_EXPIRES_IN: (0, envalid_1.str)(),
    JWT_REFRESH_SECRET_KEY: (0, envalid_1.str)(),
    JWT_REFRESH_EXPIRES_IN: (0, envalid_1.str)(),
});
function verifyUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let token = null;
        if (req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }
        console.log("req.headers.authorization");
        console.log(req.headers.authorization);
        if (!token) {
            return next(new app_error_1.default("Your not logged in", 401));
        }
        //Verify token
        try {
            const payload = (yield (0, util_1.promisify)(jsonwebtoken_1.default.verify)(token, 
            //@ts-ignore
            env.JWT_ACCESS_SECRET_KEY));
            req.user = payload.user;
            next();
        }
        catch (err) {
            console.log(err);
            res.status(401).json({ msg: "Token is not valid" });
        }
    });
}
exports.verifyUser = verifyUser;
function restrictUser(req, res, next) {
    var _a;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) != req.params.id) {
        return next(new app_error_1.default(`You can only update your own profile`, 400));
    }
    next();
}
exports.restrictUser = restrictUser;
