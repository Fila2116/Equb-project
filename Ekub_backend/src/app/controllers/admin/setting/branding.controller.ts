// src/app/controllers/admin/setting/branding.controller.ts
import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import asyncHandler from "../../../middlewares/asyncHandler";
import {
  RESOURCES,
  DESTINANTIONS,
  FILTERS,
  multerConfig,
} from "../../../config/multer.config";

const prisma = new PrismaClient();

const uploadBrandingLogos = multerConfig(
  RESOURCES.BRANDING_DARK,
  DESTINANTIONS.IMAGE.BRANDING,
  FILTERS.IMAGE
).fields([
  { name: "logoLight", maxCount: 1 },
  { name: "logoDark", maxCount: 1 },
]);

export const uploadBrandingImages = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  uploadBrandingLogos(req, res, function (err: any) {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
};

export const getBrandingConfig = async (_req: Request, res: Response) => {
  try {
    const config = await prisma.brandingConfig.findFirst();
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch branding config" });
  }
};

export const upsertBrandingConfig = async (req: Request, res: Response) => {
  const { primaryColor, secondaryColor, defaultDarkMode } = req.body;

  const files = req.files as {
    [fieldname: string]: Express.Multer.File[];
  };

  const logoLightUrl = files?.logoLight?.[0]
    ? `${files.logoLight[0].filename}`
    : undefined;

  const logoDarkUrl = files?.logoDark?.[0]
    ? `${files.logoDark[0].filename}`
    : undefined;

  try {
    const existing = await prisma.brandingConfig.findFirst();

    const config = existing
      ? await prisma.brandingConfig.update({
          where: { id: existing.id },
          data: {
            logoLightUrl: logoLightUrl ?? existing.logoLightUrl, // <- FIXED
            logoDarkUrl: logoDarkUrl ?? existing.logoDarkUrl, // <- FIXED
            primaryColor,
            secondaryColor,
            defaultDarkMode:
              defaultDarkMode === "true" || defaultDarkMode === true,
          },
        })
      : await prisma.brandingConfig.create({
          data: {
            logoLightUrl: logoLightUrl || "",
            logoDarkUrl: logoDarkUrl || "",
            primaryColor: primaryColor || "",
            secondaryColor: secondaryColor || "",
            defaultDarkMode:
              defaultDarkMode === "true" || defaultDarkMode === true,
          },
        });

    return res.json({ status: "success", data: config });
  } catch (error) {
    console.error("Branding upsert error:", error);
    return res.status(500).json({ error: "Failed to upsert branding config" });
  }
};

export const resetBrandingConfig = asyncHandler(
  async (_req: Request, res: Response) => {
    try {
      await prisma.brandingConfig.deleteMany({});
      return res.status(200).json({
        status: "success",
        message: "Branding config reset to defaults",
      });
    } catch (err) {
      return res
        .status(500)
        .json({ status: "error", message: "Failed to reset branding config" });
    }
  }
);

export const updateBrandingColors = asyncHandler(
  async (req: Request, res: Response) => {
    const { primaryColor, secondaryColor } = req.body;

    if (!primaryColor || !secondaryColor) {
      return res
        .status(400)
        .json({ status: "fail", message: "Both colors are required" });
    }

    try {
      const existing = await prisma.brandingConfig.findFirst();
      if (!existing) {
        return res
          .status(404)
          .json({ status: "fail", message: "No branding config found" });
      }

      const updated = await prisma.brandingConfig.update({
        where: { id: existing.id },
        data: { primaryColor, secondaryColor },
      });

      return res.status(200).json({ status: "success", data: updated });
    } catch (err) {
      return res
        .status(500)
        .json({ status: "error", message: "Failed to update colors" });
    }
  }
);
