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
exports.updateBrandingColors = exports.resetBrandingConfig = exports.upsertBrandingConfig = exports.getBrandingConfig = exports.uploadBrandingImages = void 0;
// src/app/controllers/admin/setting/branding.controller.ts
const client_1 = require("@prisma/client");
const asyncHandler_1 = __importDefault(require("../../../middlewares/asyncHandler"));
const multer_config_1 = require("../../../config/multer.config");
const path_1 = __importDefault(require("path"));
const prisma = new client_1.PrismaClient();
const uploadBrandingLogos = (0, multer_config_1.multerConfig)(multer_config_1.RESOURCES.BRANDING_DARK, multer_config_1.DESTINANTIONS.IMAGE.BRANDING, multer_config_1.FILTERS.IMAGE).fields([
    { name: "logoLight", maxCount: 1 },
    { name: "logoDark", maxCount: 1 },
]);
const uploadBrandingImages = (req, res, next) => {
    uploadBrandingLogos(req, res, function (err) {
        if (err) {
            return res.status(400).json({
                status: "error",
                message: err.message
            });
        }
        next();
    });
};
exports.uploadBrandingImages = uploadBrandingImages;
const getBrandingConfig = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const config = yield prisma.brandingConfig.findFirst();
        if (!config) {
            return res.status(404).json({
                status: "success",
                data: null,
                message: "No branding configuration found"
            });
        }
        // Generate full URLs for the frontend
        const responseData = Object.assign(Object.assign({}, config), { logoLightUrl: config.logoLightUrl
                ? `/images/branding/${config.logoLightUrl}`
                : null, logoDarkUrl: config.logoDarkUrl
                ? `/images/branding/${config.logoDarkUrl}`
                : null });
        return res.status(200).json({
            status: "success",
            data: responseData
        });
    }
    catch (error) {
        console.error("Failed to fetch branding config:", error);
        return res.status(500).json({
            status: "error",
            message: "Failed to fetch branding configuration",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
});
exports.getBrandingConfig = getBrandingConfig;
const upsertBrandingConfig = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    console.log("[upsertBrandingConfig] method:", req.method);
    console.log("[upsertBrandingConfig] body:", req.body);
    console.log("[upsertBrandingConfig] files:", req.files);
    const { primaryColor, secondaryColor, defaultDarkMode } = req.body;
    const files = req.files;
    try {
        // Validate required fields
        if (!primaryColor || !secondaryColor) {
            return res.status(400).json({
                status: "fail",
                message: "Primary and secondary colors are required"
            });
        }
        const existingConfig = yield prisma.brandingConfig.findFirst();
        // Prepare base data object
        const baseData = {
            primaryColor,
            secondaryColor,
            defaultDarkMode: defaultDarkMode === "true" || defaultDarkMode === true,
        };
        // Handle create vs update scenarios
        let config;
        if (existingConfig) {
            // Update existing config
            const updateData = Object.assign({}, baseData);
            // Only update logo fields if new files were provided
            if ((_b = (_a = files === null || files === void 0 ? void 0 : files.logoLight) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.filename) {
                updateData.logoLightUrl = files.logoLight[0].filename;
            }
            if ((_d = (_c = files === null || files === void 0 ? void 0 : files.logoDark) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.filename) {
                updateData.logoDarkUrl = files.logoDark[0].filename;
            }
            config = yield prisma.brandingConfig.update({
                where: { id: existingConfig.id },
                data: updateData
            });
        }
        else {
            // Create new config
            const createData = Object.assign(Object.assign({}, baseData), { logoLightUrl: ((_f = (_e = files === null || files === void 0 ? void 0 : files.logoLight) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.filename) || "", logoDarkUrl: ((_h = (_g = files === null || files === void 0 ? void 0 : files.logoDark) === null || _g === void 0 ? void 0 : _g[0]) === null || _h === void 0 ? void 0 : _h.filename) || "" });
            config = yield prisma.brandingConfig.create({
                data: createData
            });
        }
        // Prepare response with full URLs
        const responseData = Object.assign(Object.assign({}, config), { logoLightUrl: config.logoLightUrl
                ? `/images/branding/${config.logoLightUrl}`
                : null, logoDarkUrl: config.logoDarkUrl
                ? `/images/branding/${config.logoDarkUrl}`
                : null });
        return res.status(200).json({
            status: "success",
            data: responseData,
            message: existingConfig
                ? "Branding configuration updated successfully"
                : "Branding configuration created successfully"
        });
    }
    catch (error) {
        console.error("Branding upsert error:", error);
        return res.status(500).json({
            status: "error",
            message: "Failed to save branding configuration",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
});
exports.upsertBrandingConfig = upsertBrandingConfig;
exports.resetBrandingConfig = (0, asyncHandler_1.default)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma.brandingConfig.deleteMany({});
        return res.status(200).json({
            status: "success",
            message: "Branding configuration reset to defaults",
            data: null
        });
    }
    catch (error) {
        console.error("Failed to reset branding config:", error);
        return res.status(500).json({
            status: "error",
            message: "Failed to reset branding configuration",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}));
exports.updateBrandingColors = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { primaryColor, secondaryColor } = req.body;
    if (!primaryColor || !secondaryColor) {
        return res.status(400).json({
            status: "fail",
            message: "Both primary and secondary colors are required"
        });
    }
    try {
        const existing = yield prisma.brandingConfig.findFirst();
        if (!existing) {
            return res.status(404).json({
                status: "fail",
                message: "No branding configuration found to update"
            });
        }
        const updated = yield prisma.brandingConfig.update({
            where: { id: existing.id },
            data: {
                primaryColor,
                secondaryColor
            },
        });
        return res.status(200).json({
            status: "success",
            message: "Colors updated successfully",
            data: Object.assign(Object.assign({}, updated), { logoLightUrl: updated.logoLightUrl
                    ? `/images/branding/${updated.logoLightUrl}`
                    : null, logoDarkUrl: updated.logoDarkUrl
                    ? `/images/branding/${updated.logoDarkUrl}`
                    : null })
        });
    }
    catch (error) {
        console.error("Failed to update branding colors:", error);
        return res.status(500).json({
            status: "error",
            message: "Failed to update colors",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}));
// Optional helper function to delete old image files
function deleteOldImage(filename) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!filename)
            return;
        try {
            const fs = require('fs').promises;
            const imagePath = path_1.default.join(multer_config_1.DESTINANTIONS.IMAGE.BRANDING, filename);
            yield fs.unlink(imagePath);
        }
        catch (err) {
            console.error("Failed to delete old image:", err);
        }
    });
}
