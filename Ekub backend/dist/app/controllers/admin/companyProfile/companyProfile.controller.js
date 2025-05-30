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
exports.deleteCompanyProfile = exports.updateCompanyProfile = exports.createCompanyProfile = exports.getCompanyProfileForHeader = exports.getCompanyProfile = void 0;
const db_config_1 = __importDefault(require("../../../config/db.config"));
const error_config_1 = require("../../../config/error.config");
const app_error_1 = __importDefault(require("../../../shared/errors/app.error"));
exports.getCompanyProfile = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const [companyProfile, total] = yield Promise.all([
        db_config_1.default.companyProfile.findMany(),
        db_config_1.default.companyProfile.count(),
    ]);
    res.status(200).json({
        status: "success",
        data: {
            companyProfile,
            meta: {
                total,
            },
        },
    });
}));
exports.getCompanyProfileForHeader = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const [companyProfile] = yield Promise.all([
        db_config_1.default.companyProfile.findFirst(),
    ]);
    res.status(200).json({
        status: "success",
        data: {
            companyProfile,
        },
    });
}));
exports.createCompanyProfile = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { country, city, address, email, tel } = req.body;
    const companyProfile = yield db_config_1.default.companyProfile.create({
        data: {
            country: country,
            city: city,
            address: address,
            email: email,
            tel: tel,
        },
    });
    res.status(200).json({
        status: "success",
        data: {
            companyProfile,
        },
    });
}));
exports.updateCompanyProfile = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { country, city, address, email, tel } = req.body;
    const updatedData = {
        country,
        city,
        address,
        email,
        tel
    };
    const companyProfile = yield db_config_1.default.companyProfile.update({
        where: { id: req.params.id },
        data: updatedData,
    });
    if (!companyProfile) {
        return next(new app_error_1.default(`Company Profile with ID ${req.params.id} does not exist`, 400));
    }
    res.status(200).json({
        status: "success",
        data: {
            companyProfile,
        },
    });
}));
exports.deleteCompanyProfile = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Delete the companyProfile
    const companyProfile = yield db_config_1.default.companyProfile.delete({
        where: {
            id: req.params.id,
        },
    });
    res.status(200).json({
        status: "success",
        message: "CompanyProfile deleted successfully",
    });
}));
