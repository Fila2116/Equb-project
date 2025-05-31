"use strict";
// src/app/controllers/admin/setting/branding.controller.ts
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
exports.updateBrandingColors = exports.resetBrandingConfig = exports.upsertBrandingConfig = exports.getBrandingConfig = void 0;
const client_1 = require("@prisma/client");
const asyncHandler_1 = __importDefault(require("../../../middlewares/asyncHandler"));
const prisma = new client_1.PrismaClient();
const getBrandingConfig = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const config = yield prisma.brandingConfig.findFirst();
        res.json(config);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch branding config' });
    }
});
exports.getBrandingConfig = getBrandingConfig;
const upsertBrandingConfig = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { logoLightUrl, logoDarkUrl, primaryColor, secondaryColor, defaultDarkMode } = req.body;
    try {
        const existing = yield prisma.brandingConfig.findFirst();
        const config = existing
            ? yield prisma.brandingConfig.update({
                where: { id: existing.id },
                data: { logoLightUrl, logoDarkUrl, primaryColor, secondaryColor, defaultDarkMode },
            })
            : yield prisma.brandingConfig.create({
                data: { logoLightUrl, logoDarkUrl, primaryColor, secondaryColor, defaultDarkMode },
            });
        return res.json(config);
    }
    catch (error) {
        console.error("💥 Branding upsert error:", error);
        return res.status(500).json({ error: 'Failed to upsert branding config' });
    }
});
exports.upsertBrandingConfig = upsertBrandingConfig;
exports.resetBrandingConfig = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma.brandingConfig.deleteMany({});
        return res.status(200).json({ status: 'success', message: 'Branding config reset to defaults' });
    }
    catch (err) {
        return res.status(500).json({ status: 'error', message: 'Failed to reset branding config' });
    }
}));
exports.updateBrandingColors = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { primaryColor, secondaryColor } = req.body;
    if (!primaryColor || !secondaryColor) {
        return res.status(400).json({ status: 'fail', message: 'Both colors are required' });
    }
    try {
        const existing = yield prisma.brandingConfig.findFirst();
        if (!existing) {
            return res.status(404).json({ status: 'fail', message: 'No branding config found' });
        }
        const updated = yield prisma.brandingConfig.update({
            where: { id: existing.id },
            data: { primaryColor, secondaryColor }
        });
        return res.status(200).json({ status: 'success', data: updated });
    }
    catch (err) {
        return res.status(500).json({ status: 'error', message: 'Failed to update colors' });
    }
}));
