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
exports.refreshToken = exports.resetPassword = exports.forgotPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_config_1 = __importDefault(require("../../../config/db.config"));
const app_error_1 = __importDefault(require("../../../shared/errors/app.error"));
const util_1 = require("util");
const envalid_1 = require("envalid");
const error_config_1 = require("../../../config/error.config");
// import { createPasswordResetToken } from "./user-auth.helper";
const sms_service_1 = __importDefault(require("../../../shared/sms/services/sms.service"));
const multer_config_1 = require("../../../config/multer.config");
const mail_service_1 = __importDefault(require("../../../shared/mail/services/mail.service"));
const client_1 = require("@prisma/client");
const env = (0, envalid_1.cleanEnv)(process.env, {
    JWT_ACCESS_SECRET_KEY: (0, envalid_1.str)(),
    JWT_ACCESS_EXPIRES_IN: (0, envalid_1.str)(),
    JWT_REFRESH_SECRET_KEY: (0, envalid_1.str)(),
    JWT_REFRESH_EXPIRES_IN: (0, envalid_1.str)(),
});
const upload = (0, multer_config_1.multerConfig)(multer_config_1.RESOURCES.AVATAR, multer_config_1.DESTINANTIONS.IMAGE.AVATAR, multer_config_1.FILTERS.IMAGE);
/**
 * Upload Middleware
 */
const uploadImage = {
    pre: upload.single("picture"),
    post: (req, _, next) => {
        console.log("req.file");
        console.log(req.file);
        if (req.file) {
            req.body.picture = req.file.filename;
        }
        next();
    },
};
const sendOtp = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
    const { to } = req.body;
    //See if a Building with that admin exists
    const user = yield db_config_1.default.user.findFirst({
        where: {
            OR: [
                { email: to },
                { phoneNumber: to },
            ],
        },
    });
    // const user = await prisma.user.findUnique({ where: { phoneNumber: to } });
    if (user) {
        return next(new app_error_1.default(`Phone number or email exists.`, 400));
    }
    const isEmail = /^[^\s@]+@(gmail\.com|companyname\.com)$/.test(to);
    const isPhone = /^\+251\d{9}$/.test(to); // Adjust length as per your requirements
    if (isEmail) {
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        console.log("otp.....", otp);
        yield mail_service_1.default.sendOTPMailRegister(to, otp);
        yield db_config_1.default.inActiveUser.create({
            data: {
                email: to,
            },
        });
        return res.status(200).json({
            status: "success",
            message: "otp sent successfuly",
            code: otp,
        });
    }
    else if (isPhone) {
        const { data } = (yield sms_service_1.default.sendOtp(to, "Your verification code is "));
        //create inactive user
        console.log("data", data.response.code);
        yield db_config_1.default.inActiveUser.create({
            data: {
                phoneNumber: to,
            },
        });
        return res.json({
            status: data.acknowledge,
            code: data.response.code,
        });
    }
}));
const signupUser = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log("req.body");
    console.log(req.body);
    const { username, firstName, lastName, phoneNumber, email, password, fileName, } = req.body;
    try {
        //Encrypt password
        let hashedPassword = "";
        if (password) {
            const salt = yield bcryptjs_1.default.genSalt(10);
            hashedPassword = yield bcryptjs_1.default.hash(password, salt);
        }
        //Check if user already exists and Delete it from inactive user table
        const existingUser = yield db_config_1.default.inActiveUser.findFirst({
            where: {
                OR: [
                    { email: email },
                    { phoneNumber: phoneNumber },
                ],
            },
        });
        if (existingUser) {
            yield db_config_1.default.inActiveUser.deleteMany({
                where: {
                    OR: [
                        { email: email },
                        { phoneNumber: phoneNumber },
                    ],
                },
            });
            console.log("Inactive user(s) deleted.");
        }
        else {
            console.log("No inactive user found with that phone number.");
        }
        const user = yield db_config_1.default.user.create({
            data: Object.assign({ fullName: `${firstName} ${lastName}`, firstName: firstName, lastName: lastName, phoneNumber: phoneNumber ? phoneNumber : "", password: hashedPassword, email: email, avatar: fileName ? fileName : null }, (username && { username: username })),
        });
        //Return jsonwebtoken :to login the user
        const payload = {
            user: {
                id: user.id,
            },
        };
        const accessToken = yield (0, util_1.promisify)(jsonwebtoken_1.default.sign)(payload, 
        //@ts-ignore
        env.JWT_ACCESS_SECRET_KEY, { expiresIn: env.JWT_ACCESS_EXPIRES_IN });
        const refreshToken = yield (0, util_1.promisify)(jsonwebtoken_1.default.sign)(payload, 
        //@ts-ignore
        env.JWT_REFRESH_SECRET_KEY, {
            expiresIn: env.JWT_REFRESH_EXPIRES_IN,
        });
        res.status(200).json({
            user,
            accessToken,
            refreshToken,
        });
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002") {
            // Handle unique constraint error
            const uniqueField = (_a = error.meta) === null || _a === void 0 ? void 0 : _a.target;
            const fieldName = Array.isArray(uniqueField)
                ? uniqueField.join(", ")
                : uniqueField;
            return next(new app_error_1.default(`The ${fieldName} already exists. Please use a different value.`, 400));
        }
        // Other errors
        console.error("Signup error:", error);
        return next(new app_error_1.default("Failed to create user", 500));
    }
}));
const getUser = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    console.log(req.user);
    let user = yield db_config_1.default.user.findUnique({ where: { id: (_b = req === null || req === void 0 ? void 0 : req.user) === null || _b === void 0 ? void 0 : _b.id } });
    res.json({ user });
}));
const loginUser = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("req.body");
    console.log(req.body);
    const { phoneNumber, password } = req.body;
    //See if a Building with that admin exists
    const user = yield db_config_1.default.user.findFirst({
        where: {
            OR: [
                { email: phoneNumber },
                { phoneNumber: phoneNumber },
            ],
        },
        include: {
            deviceTokens: {
                select: { token: true },
            },
        },
    });
    if (!user) {
        return next(new app_error_1.default(`User not found`, 400));
    }
    console.log("found user", user);
    // console.log(user);
    //Check Password
    const isMatch = yield bcryptjs_1.default.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({
            errors: [{ msg: "Password not correct." }],
        });
    }
    //Return jsonwebtoken :to login the user
    const payload = {
        user: {
            id: user.id,
        },
    };
    const accessToken = yield (0, util_1.promisify)(jsonwebtoken_1.default.sign)(payload, 
    //@ts-ignore
    env.JWT_ACCESS_SECRET_KEY, { expiresIn: env.JWT_ACCESS_EXPIRES_IN });
    const refreshToken = yield (0, util_1.promisify)(jsonwebtoken_1.default.sign)(payload, 
    //@ts-ignore
    env.JWT_REFRESH_SECRET_KEY, {
        expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    });
    res.status(200).json({
        user,
        accessToken,
        refreshToken,
    });
}));
exports.forgotPassword = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield db_config_1.default.user.findFirst({
        where: {
            OR: [
                { email: req.body.phoneNumber },
                { phoneNumber: req.body.phoneNumber },
            ],
        },
    });
    if (!user) {
        return next(new app_error_1.default("There is no user with this phone number", 404));
    }
    // const token = await createPasswordResetToken(user.email);
    // await MailService.sendResetPasssword(user.email, token, user.role.type.value);
    // const otpRes =( await SMSService.sendOtp(req.body.phoneNumber,'Your OTP for password reset is ')) as unknown as AxiosResponse;
    // const otp = otpRes.data.response.code;
    // console.log('otp',otp);
    // console.log('user',user);
    // Generate a random OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log("otp", otp);
    yield db_config_1.default.user.update({
        where: { id: user.id },
        data: { passwordResetToken: otp },
    });
    const isEmail = /^[^\s@]+@(gmail\.com|companyname\.com)$/.test(req.body.phoneNumber);
    const isPhone = /^\+251\d{9}$/.test(req.body.phoneNumber); // Adjust length as per your requirements
    if (isEmail) {
        yield mail_service_1.default.sendOTPMail(user.email, user.fullName, otp);
    }
    else if (isPhone) {
        yield sms_service_1.default.sendSms(user.phoneNumber, `hey ${user.fullName}, Your verification code is : ${otp} `);
    }
    return res.status(200).json({
        status: "success",
        message: "otp sent successfuly",
        otp,
    });
}));
exports.resetPassword = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield db_config_1.default.user.findFirst({
        where: { passwordResetToken: req.body.otp },
    });
    // const user = await prisma.user.findUnique({
    //   where: {
    //     phoneNumber: req.body.phoneNumber,
    //   },
    // });
    if (!user) {
        return next(new app_error_1.default("Invalid or expired otp", 404));
    }
    const password = yield bcryptjs_1.default.hash(req.body.password, 10);
    yield db_config_1.default.user.update({
        where: { id: user.id },
        data: {
            password,
            passwordResetToken: null,
            passwordResetExpiresIn: null,
        },
    });
    res.status(200).json({
        status: "success",
        message: "Password reseted successfuly",
    });
}));
exports.refreshToken = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let token = null;
        if (req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }
        if (!token) {
            return next(new app_error_1.default("You did not provide refresh token", 400));
        }
        const payload = yield (0, util_1.promisify)(jsonwebtoken_1.default.verify)(token, 
        //@ts-ignore
        env.JWT_REFRESH_SECRET_KEY);
        //@ts-ignore
        const { id } = payload;
        const newAccessToken = jsonwebtoken_1.default.sign({ id }, env.JWT_ACCESS_SECRET_KEY, 
        //@ts-ignore
        {
            expiresIn: env.JWT_ACCESS_EXPIRES_IN,
        });
        const newRefreshToken = jsonwebtoken_1.default.sign({ id }, env.JWT_REFRESH_SECRET_KEY, 
        //@ts-ignore
        {
            expiresIn: env.JWT_REFRESH_EXPIRES_IN,
        });
        res.status(200).json({
            status: "success",
            data: {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            },
        });
    }
    catch (err) {
        if (err.name == "TokenExpiredError") {
            next(new app_error_1.default("The token has expired", 400));
        }
        if (err.name == "JsonWebTokenError") {
            next(new app_error_1.default(`The token is invalid ${err}`, 400));
        }
    }
}));
exports.default = {
    uploadImage,
    sendOtp,
    signupUser,
    loginUser,
    getUser,
    forgotPassword: exports.forgotPassword,
    resetPassword: exports.resetPassword,
    refreshToken: exports.refreshToken,
};
