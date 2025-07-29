"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.multerConfig = exports.FILTERS = exports.FILENAME = exports.DESTINANTIONS = exports.RESOURCES = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const app_error_1 = __importDefault(require("../shared/errors/app.error"));
// 2. Keep your original constants exactly as they were
exports.RESOURCES = {
    CATEGORY: "CATEGORY",
    AVATAR: "AVATAR",
    BANNER: "BANNER",
    PAYMENT: "PAYMENT",
    GUARANTEE: "GUARANTEE",
    BRANDING_LIGHT: "BRANDING_LIGHT",
    BRANDING_DARK: "BRANDING_DARK",
};
exports.DESTINANTIONS = {
    IMAGE: {
        CATEGORY: "../../../public/images/category",
        AVATAR: "../../../public/images/avatar",
        BANNER: "../../../public/images/banner",
        PAYMENT: "../../../public/images/payment",
        GUARANTEE: "../../../public/images/guarantee",
        BRANDING: "../../../public/images/branding",
    },
};
exports.FILENAME = {
    CATEGORY: (originalname) => `category-${(0, uuid_1.v4)()}${path_1.default.extname(originalname)}`,
    AVATAR: (originalname) => `avatar-${(0, uuid_1.v4)()}${path_1.default.extname(originalname)}`,
    BANNER: (originalname) => `banner-${(0, uuid_1.v4)()}${path_1.default.extname(originalname)}`,
    PAYMENT: (originalname) => `payment-${(0, uuid_1.v4)()}${path_1.default.extname(originalname)}`,
    GUARANTEE: (originalname) => `guarantee-${(0, uuid_1.v4)()}${path_1.default.extname(originalname)}`,
    BRANDING_LIGHT: (originalname) => `branding-logo-${(0, uuid_1.v4)()}${path_1.default.extname(originalname)}`,
    BRANDING_DARK: (originalname) => `branding-logo-${(0, uuid_1.v4)()}${path_1.default.extname(originalname)}`,
};
exports.FILTERS = {
    IMAGE: {
        CONTENT: ["image/png", "image/jpg", "image/jpeg"],
        MESSAGE: "Only .png, .jpg and .jpeg format allowed!",
    },
};
// 3. Corrected multerConfig function with proper typing
const multerConfig = (resource, destination, filter) => {
    const storage = multer_1.default.diskStorage({
        destination: function (req, file, cb) {
            try {
                cb(null, path_1.default.join(__dirname, destination));
            }
            catch (err) {
                cb(new Error("Invalid file destination"), '');
            }
        },
        filename: function (req, file, cb) {
            try {
                const fileName = exports.FILENAME[resource](file.originalname);
                req.body.fileName = fileName;
                cb(null, fileName);
            }
            catch (err) {
                cb(new Error("Failed to generate filename"), '');
            }
        },
    });
    return (0, multer_1.default)({
        storage,
        limits: {
            fileSize: 1024 * 1024 * 5, // 5MB
            fieldSize: 1024 * 1024 * 10, // 10MB
        },
        fileFilter: function (req, file, cb) {
            try {
                if (filter.CONTENT.includes(file.mimetype)) {
                    cb(null, true);
                }
                else {
                    cb(new app_error_1.default(filter.MESSAGE, 400));
                }
            }
            catch (err) {
                cb(new app_error_1.default("File filter error", 500));
            }
        },
    });
};
exports.multerConfig = multerConfig;
