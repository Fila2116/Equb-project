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
exports.updateBankAccount = exports.addBankAccount = exports.getMyBankAccounts = exports.updatePersonalInfo = exports.updateProfilePic = exports.getUser = exports.getMyProfile = exports.uploadImage = void 0;
const db_config_1 = __importDefault(require("../../../config/db.config"));
const error_config_1 = require("../../../config/error.config");
const app_error_1 = __importDefault(require("../../../shared/errors/app.error"));
const multer_config_1 = require("../../../config/multer.config");
const upload = (0, multer_config_1.multerConfig)(multer_config_1.RESOURCES.AVATAR, multer_config_1.DESTINANTIONS.IMAGE.AVATAR, multer_config_1.FILTERS.IMAGE);
/**
* Upload Middleware
*/
exports.uploadImage = {
    pre: upload.single("picture"),
    post: (req, _, next) => {
        console.log('req.file');
        console.log(req.file);
        if (req.file) {
            req.body.picture = req.file.filename;
        }
        next();
    },
};
exports.getMyProfile = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = yield db_config_1.default.user.findUnique({ where: { id: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id }, include: {
            bankAccounts: true
        } });
    if ((user === null || user === void 0 ? void 0 : user.firstName) && (user === null || user === void 0 ? void 0 : user.lastName) && (user === null || user === void 0 ? void 0 : user.email) && (user === null || user === void 0 ? void 0 : user.bankAccounts.length) > 0 && user.kycId) {
        user.profileCompletion = 100;
    }
    res.status(200).json({
        status: "success",
        data: {
            user
        },
    });
}));
exports.getUser = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield db_config_1.default.user.findUnique({
        where: {
            id: req.params.id,
        },
        include: { kyc: true }
    });
    if (!user) {
        return next(new app_error_1.default(`User with ID ${req.params.id} does not exist`, 400));
    }
    res.status(200).json({
        status: "success",
        data: {
            user,
        },
    });
}));
exports.updateProfilePic = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { fileName } = req.body;
    const updatedData = {};
    if (fileName)
        updatedData.avatar = fileName;
    const user = yield db_config_1.default.user.update({
        where: { id: req.params.id },
        data: updatedData
    });
    res.status(200).json({
        status: "success",
        data: {
            user,
        },
    });
}));
exports.updatePersonalInfo = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, lastName, grandFatherName, phoneNumber, username, email, gender, fileName } = req.body;
    const updatedData = {
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        phoneNumber
    };
    if (username)
        updatedData.username = username;
    if (email)
        updatedData.email = email;
    if (fileName)
        updatedData.avatar = fileName;
    if (grandFatherName)
        updatedData.grandFatherName = grandFatherName;
    const userKyc = yield db_config_1.default.kyc.create({
        data: {
            firstName: firstName,
            fatherName: lastName,
            grandFatherName: grandFatherName ? grandFatherName : '',
            gender: gender ? gender : null
        }
    });
    updatedData.kycId = userKyc.id;
    updatedData.profileCompletion = 75;
    const user = yield db_config_1.default.user.update({ where: { id: req.params.id }, data: updatedData, include: { kyc: true } });
    if (!user) {
        return next(new app_error_1.default(`User with ID ${req.params.id} does not exist`, 400));
    }
    res.status(200).json({
        status: "success",
        data: {
            user,
        },
    });
}));
exports.getMyBankAccounts = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const user = yield db_config_1.default.user.findUnique({
        where: {
            id: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id,
        },
        include: { bankAccounts: {
                include: { bank: true }
            } }
    });
    res.status(200).json({
        status: "success",
        data: {
            bankAccounts: user === null || user === void 0 ? void 0 : user.bankAccounts,
        },
    });
}));
exports.addBankAccount = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const { bankId, accountName, accountNumber } = req.body;
    const bank = yield db_config_1.default.bank.findUnique({ where: { id: bankId } });
    if (!bank) {
        return next(new app_error_1.default(`Bank with ID ${bankId} does not exist`, 400));
    }
    console.log('req.user');
    console.log(req.user);
    const bankAccount = yield db_config_1.default.bankAccount.create({
        //@ts-ignore
        data: {
            accountName: accountName,
            accountNumber: accountNumber,
            userId: (_c = req.user) === null || _c === void 0 ? void 0 : _c.id,
            bankId: bankId,
        },
        include: { bank: true }
    });
    const user = yield db_config_1.default.user.update({ where: { id: req.params.id }, data: { profileCompletion: 100 }, include: { kyc: true } });
    res.status(200).json({
        status: "success",
        data: {
            bankAccount,
        },
    });
}));
exports.updateBankAccount = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { accountName, accountNumber } = req.body;
    const bankAccount = yield db_config_1.default.bankAccount.update({
        where: { id: req.params.id },
        data: {
            accountName: accountName,
            accountNumber: accountNumber
        },
        include: { bank: true }
    });
    if (!bankAccount) {
        return next(new app_error_1.default(`Bank account with ID ${req.params.id} does not exist`, 400));
    }
    res.status(200).json({
        status: "success",
        data: {
            bankAccount,
        },
    });
}));
