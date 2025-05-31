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
exports.resetPassword = exports.forgotPassword = exports.getLocationName = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_config_1 = __importDefault(require("../../../config/db.config"));
const app_error_1 = __importDefault(require("../../../shared/errors/app.error"));
const envalid_1 = require("envalid");
const error_config_1 = require("../../../config/error.config");
const util_1 = require("util");
const sms_service_1 = __importDefault(require("../../../shared/sms/services/sms.service"));
// geolocation.ts
const node_geocoder_1 = __importDefault(require("node-geocoder"));
const mail_service_1 = __importDefault(require("../../../shared/mail/services/mail.service"));
const env = (0, envalid_1.cleanEnv)(process.env, {
    JWT_ACCESS_SECRET_KEY: (0, envalid_1.str)(),
    JWT_ACCESS_EXPIRES_IN: (0, envalid_1.str)(),
    JWT_REFRESH_SECRET_KEY: (0, envalid_1.str)(),
    JWT_REFRESH_EXPIRES_IN: (0, envalid_1.str)(),
});
const getStaff = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).json({
        status: "success",
        data: {
            user: req.staff,
        },
    });
}));
const options = {
    provider: 'openstreetmap', // or 'google', 'opencage', etc.
};
const geocoder = (0, node_geocoder_1.default)(options);
function getLocationName(latitude, longitude) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const res = yield geocoder.reverse({ lat: latitude, lon: longitude });
            const loc = res[0];
            return {
                city: loc.city,
                state: loc.state,
                country: loc.country,
            };
        }
        catch (err) {
            console.error('Geocoding failed:', err);
            return { city: 'Unknown', state: 'Unknown', country: 'Unknown' };
        }
    });
}
exports.getLocationName = getLocationName;
const loginStaff = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { email, password } = req.body;
    //See if a Building with that admin exists
    let user = yield db_config_1.default.staff.findUnique({
        where: { email: email },
        include: { role: true },
    });
    if (!user) {
        return next(new app_error_1.default(`Staff not found`, 400));
    }
    // if (user.BolckEndDate && user.BolckEndDate > new Date()) {
    //   return next(new AppError(`You have tried incorrect attempts. The system is locked. Please try again after 30 minutes.`, 400));
    // }
    // Check Password
    const isMatch = yield bcryptjs_1.default.compare(password, user.password);
    if (!isMatch) {
        // Increment the failure count
        const FailureCount = ++user.FailureCount;
        console.log("FailureCount", FailureCount);
        // If the failure count reaches 5, block the user for 5 minutes
        console.log("password", password);
        // Update the user record in the database
        yield db_config_1.default.staff.update({
            where: { id: user.id }, // Assuming 'user.id' is the unique identifier for the user
            data: {
                FailureCount: FailureCount
            },
        });
        // If the failure count reaches 5, block the user for 5 minutes
        if (user.FailureCount >= 5) {
            // Update the user record in the database
            yield db_config_1.default.staff.update({
                where: { id: user.id }, // Assuming 'user.id' is the unique identifier for the user
                data: {
                    BolckEndDate: new Date(Date.now() + 30 * 60 * 1000) // Block for 30 minutes from now
                },
            });
            // if (latitude && longitude) {
            //   // Get the user's IP address
            //   const location = await getLocationName(latitude, longitude);
            //   // Send an email to the admin with the user's details
            //   const staff = await prisma.staff.findFirst({
            //     where: {
            //       role: {
            //         name: "Super Admin"
            //       },
            //     },
            //   });
            //   if (staff) {
            //     await MailService.sendAdminLoginAlertMail(staff.email ?? '', user, location.city ?? '', location.state ?? '', location.country ?? '');
            //   }
            // }
            // Send an email to the admin with the user's details
            const staff = yield db_config_1.default.staff.findFirst({
                where: {
                    role: {
                        name: "Super Admin"
                    },
                },
            });
            if (staff) {
                yield mail_service_1.default.sendAdminLoginAlertMailWithOutLocation((_a = staff.email) !== null && _a !== void 0 ? _a : '', user);
            }
            // Return an error message if the credentials are invalid
        }
        return next(new app_error_1.default(`Invalid credentials`, 400));
    }
    //TODO: Reset the count of fail here
    // Update the user record in the database
    yield db_config_1.default.staff.update({
        where: { id: user.id }, // Assuming 'user.id' is the unique identifier for the user
        data: {
            FailureCount: 0,
            BolckEndDate: null,
        },
    });
    //Return jsonwebtoken :to login the user
    const payload = {
        id: user.id,
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
        status: "success",
        data: {
            user,
            accessToken,
            refreshToken,
        },
    });
}));
const verify = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { otpCode } = req.body;
    console.log("req.user");
    console.log(req.staff);
    //See if a Building with that admin exists
    let user = yield db_config_1.default.staff.findFirst({
        where: {
            AND: [
                { adminOtpCode: otpCode },
                { OtpCodeExpires: { gte: new Date() } }
            ]
        }
    });
    console.log("otpCode", otpCode);
    console.log("found user", user);
    if (!user) {
        return next(new app_error_1.default(`Staff not found`, 400));
    }
    else {
        res.status(200).json({
            status: "success",
            data: {
                isVerified: true,
            },
        });
    }
}));
const sendOtpToAdmin = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
    const staff = yield db_config_1.default.staff.findFirst({
        where: {
            role: {
                name: "Super Admin"
            },
        },
    });
    if (staff) {
        const { data } = (yield sms_service_1.default.sendOtp(staff.phoneNumber, "Your verification code is "));
        console.log("data", data);
        //Update the staff with the OTP code and expiration time
        yield db_config_1.default.staff.update({
            where: { id: staff.id },
            data: {
                adminOtpCode: data.response.code,
                OtpCodeExpires: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
            },
        });
        return res.json({
            status: data.acknowledge,
            code: data.response.code,
        });
    }
}));
exports.forgotPassword = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("req.body.emailOrPhoneNumber", req.body.emailOrPhoneNumber);
    const staff = yield db_config_1.default.staff.findFirst({
        where: {
            OR: [
                { email: req.body.emailOrPhoneNumber },
                { phoneNumber: req.body.emailOrPhoneNumber },
            ],
        },
    });
    if (!staff) {
        return next(new app_error_1.default("There is no staff with this phone number or email", 404));
    }
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    yield db_config_1.default.staff.update({
        where: { id: staff.id },
        data: { passwordResetToken: otp },
    });
    const isEmail = /^[^\s@]+@(gmail\.com|companyname\.com)$/.test(req.body.emailOrPhoneNumber);
    const isPhone = /^(\+2519\d{8}|09\d{8})$/.test(req.body.emailOrPhoneNumber);
    console.log("this is phone......", isPhone);
    if (isEmail) {
        yield mail_service_1.default.sendOTPMail(staff.email, staff.fullName, otp);
    }
    else if (isPhone) {
        yield sms_service_1.default.sendSms(staff.phoneNumber, `hey ${staff.fullName}, Your verification code is : ${otp} `);
    }
    return res.status(200).json({
        status: "success",
        message: "otp sent successfuly",
        otp,
    });
}));
exports.resetPassword = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield db_config_1.default.staff.findFirst({
        where: { passwordResetToken: req.body.otp },
    });
    if (!user) {
        return next(new app_error_1.default("Invalid or expired otp", 404));
    }
    const password = yield bcryptjs_1.default.hash(req.body.password, 10);
    yield db_config_1.default.staff.update({
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
exports.default = { loginStaff, getStaff, verify, sendOtpToAdmin, forgotPassword: exports.forgotPassword, resetPassword: exports.resetPassword };
