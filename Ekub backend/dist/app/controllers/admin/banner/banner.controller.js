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
exports.deleteBanner = exports.updateBanner = exports.createBanner = exports.getBanner = exports.getBanners = exports.uploadImage = void 0;
const db_config_1 = __importDefault(require("../../../config/db.config"));
const error_config_1 = require("../../../config/error.config");
const app_error_1 = __importDefault(require("../../../shared/errors/app.error"));
const client_1 = require("@prisma/client");
const multer_config_1 = require("../../../config/multer.config");
const upload = (0, multer_config_1.multerConfig)(multer_config_1.RESOURCES.BANNER, multer_config_1.DESTINANTIONS.IMAGE.BANNER, multer_config_1.FILTERS.IMAGE);
/**
 * Upload Middleware
 */
exports.uploadImage = {
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
exports.getBanners = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const page = Number(query._page) || 1;
    const limit = Number(query._limit) || 10;
    const state = query.state;
    const validStates = Object.values(client_1.State);
    if (state && !validStates.includes(state)) {
        return next(new app_error_1.default(`Invalid state parameter: ${state}`, 400));
    }
    const skip = (page - 1) * limit;
    const filter = {};
    if (state)
        filter.state = state;
    const currentDate = new Date();
    // Fetch banners with filters
    const banners = yield db_config_1.default.banner.findMany({
        where: filter,
        take: limit,
        skip,
    });
    const SortedBanners = banners.sort((a, b) => {
        const diffA = new Date(a.validUntil).getTime() - new Date(a.validFrom).getTime();
        const diffB = new Date(b.validUntil).getTime() - new Date(b.validFrom).getTime();
        return diffA - diffB;
    });
    const updatedBanners = yield Promise.all(banners.map((banner) => __awaiter(void 0, void 0, void 0, function* () {
        if (banner.validUntil) {
            const isExpired = banner.validUntil.getTime() < currentDate.getTime();
            const targetState = isExpired ? "inactive" : "active";
            if (banner.state !== targetState) {
                yield db_config_1.default.banner.update({
                    where: { id: banner.id },
                    data: { state: targetState },
                });
                banner.state = targetState;
            }
        }
        return banner;
    })));
    const total = yield db_config_1.default.banner.count({ where: filter });
    res.status(200).json({
        status: "success",
        data: {
            banners: SortedBanners,
            meta: {
                page,
                limit,
                total,
            },
        },
    });
}));
exports.getBanner = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const banner = yield db_config_1.default.banner.findUnique({
        where: {
            id: req.params.id,
        },
    });
    if (!banner) {
        return next(new app_error_1.default(`Banner with ID ${req.params.id} does not exist`, 400));
    }
    res.status(200).json({
        status: "success",
        data: {
            banner,
        },
    });
}));
exports.createBanner = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { name, description, state, validFrom, validUntil, fileName } = req.body;
    const endDate = new Date(validUntil);
    endDate.setHours(12, 0, 0, 0);
    const banner = yield db_config_1.default.banner.create({
        data: {
            name: name,
            description: description ? description : "",
            state: state,
            validFrom: new Date(validFrom),
            validUntil: endDate,
            picture: fileName ? fileName : null,
        },
    });
    yield db_config_1.default.activity.create({
        data: {
            action: client_1.Permissions.banner,
            staffId: (_a = req.staff) === null || _a === void 0 ? void 0 : _a.id,
            bannerId: banner.id,
            description: `${(_b = req.staff) === null || _b === void 0 ? void 0 : _b.fullName} added a new Banner - ${banner.name}.`,
        },
    });
    res.status(200).json({
        status: "success",
        data: {
            banner,
        },
    });
}));
exports.updateBanner = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    const { name, description, state, validFrom, validUntil } = req.body;
    const updatedData = {
        name,
    };
    if (state)
        updatedData.state = state;
    if (description)
        updatedData.description = description;
    if (validFrom)
        updatedData.validFrom = new Date(validFrom);
    if (validUntil)
        updatedData.validUntil = new Date(validUntil);
    // Fetch the current banner to compare dates
    const existingBanner = yield db_config_1.default.banner.findUnique({
        where: { id: req.params.id },
    });
    if (!existingBanner) {
        return next(new app_error_1.default(`Banner with ID ${req.params.id} does not exist`, 400));
    }
    if (existingBanner.state == state) {
        // Automatically adjust `state` based on `validUntil` date
        const currentDate = new Date();
        if (updatedData.validUntil) {
            if (new Date(updatedData.validUntil) < currentDate) {
                updatedData.state = "inactive";
            }
            else {
                updatedData.state = "active";
            }
        }
        else if (existingBanner.validUntil &&
            new Date(existingBanner.validUntil) < currentDate) {
            updatedData.state = "inactive";
        }
    }
    // Update the banner with the new data
    const banner = yield db_config_1.default.banner.update({
        where: { id: req.params.id },
        data: updatedData,
    });
    // Record the activity
    yield db_config_1.default.activity.create({
        data: {
            action: client_1.Permissions.banner,
            staffId: (_c = req.staff) === null || _c === void 0 ? void 0 : _c.id,
            bannerId: banner.id,
            description: `${(_d = req.staff) === null || _d === void 0 ? void 0 : _d.fullName} updated a Banner.`,
        },
    });
    res.status(200).json({
        status: "success",
        data: {
            banner,
        },
    });
}));
exports.deleteBanner = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const bannerId = req.params.id;
    // Delete related records in the EquberUser table
    yield db_config_1.default.banner.deleteMany({
        where: {
            id: bannerId,
        },
    });
    res.status(200).json({
        status: "success",
    });
}));
