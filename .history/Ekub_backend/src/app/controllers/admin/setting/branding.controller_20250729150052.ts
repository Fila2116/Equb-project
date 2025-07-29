// src/app/controllers/admin/setting/branding.controller.ts
import { PrismaClient, Prisma } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import asyncHandler from "../../../middlewares/asyncHandler";
import {
  RESOURCES,
  DESTINANTIONS,
  FILTERS,
  multerConfig,
} from "../../../config/multer.config";
import path from "path";

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
    if (err) {
      return res.status(400).json({ 
        status: "error",
        message: err.message 
      });
    }
    next();
  });
};

export const getBrandingConfig = async (_req: Request, res: Response) => {
  try {
    const config = await prisma.brandingConfig.findFirst();
    
    if (!config) {
      return res.status(404).json({ 
        status: "success",
        data: null,
        message: "No branding configuration found" 
      });
    }

    // Generate full URLs for the frontend
    const responseData = {
      ...config,
      logoLightUrl: config.logoLightUrl 
        ? `/images/branding/${config.logoLightUrl}`
        : null,
      logoDarkUrl: config.logoDarkUrl 
        ? `/images/branding/${config.logoDarkUrl}`
        : null
    };

    return res.status(200).json({
      status: "success",
      data: responseData
    });

  } catch (error) {
    console.error("Failed to fetch branding config:", error);
    return res.status(500).json({ 
      status: "error",
      message: "Failed to fetch branding configuration",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

export const upsertBrandingConfig = async (req: Request, res: Response) => {
  console.log("[upsertBrandingConfig] method:", req.method);
  console.log("[upsertBrandingConfig] body:", req.body);
  console.log("[upsertBrandingConfig] files:", req.files);
  const { primaryColor, secondaryColor, defaultDarkMode } = req.body;

  const files = req.files as {
    [fieldname: string]: Express.Multer.File[];
  };

  try {
    // Validate required fields
    if (!primaryColor || !secondaryColor) {
      return res.status(400).json({
        status: "fail",
        message: "Primary and secondary colors are required"
      });
    }

    const existingConfig = await prisma.brandingConfig.findFirst();

    // Prepare base data object
    const baseData = {
      primaryColor,
      secondaryColor,
      defaultDarkMode: defaultDarkMode === "true" || defaultDarkMode === true,
    };

    // Handle create vs update scenarios
    let config: Prisma.BrandingConfigGetPayload<{}>;
    
    if (existingConfig) {
      // Update existing config
      const updateData: Prisma.BrandingConfigUpdateInput = {
        ...baseData
      };

      // Only update logo fields if new files were provided
      if (files?.logoLight?.[0]?.filename) {
        updateData.logoLightUrl = files.logoLight[0].filename;
      }
      if (files?.logoDark?.[0]?.filename) {
        updateData.logoDarkUrl = files.logoDark[0].filename;
      }

      config = await prisma.brandingConfig.update({
        where: { id: existingConfig.id },
        data: updateData
      });
    } else {
      // Create new config
      const createData: Prisma.BrandingConfigCreateInput = {
        ...baseData,
        logoLightUrl: files?.logoLight?.[0]?.filename || "",
        logoDarkUrl: files?.logoDark?.[0]?.filename || ""
      };

      config = await prisma.brandingConfig.create({
        data: createData
      });
    }

    // Prepare response with full URLs
    const responseData = {
      ...config,
      logoLightUrl: config.logoLightUrl 
        ? `/images/branding/${config.logoLightUrl}`
        : null,
      logoDarkUrl: config.logoDarkUrl 
        ? `/images/branding/${config.logoDarkUrl}`
        : null
    };

    return res.status(200).json({
      status: "success",
      data: responseData,
      message: existingConfig 
        ? "Branding configuration updated successfully" 
        : "Branding configuration created successfully"
    });

  } catch (error) {
    console.error("Branding upsert error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to save branding configuration",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

export const resetBrandingConfig = asyncHandler(
  async (_req: Request, res: Response) => {
    try {
      await prisma.brandingConfig.deleteMany({});
      
      return res.status(200).json({
        status: "success",
        message: "Branding configuration reset to defaults",
        data: null
      });
    } catch (error) {
      console.error("Failed to reset branding config:", error);
      return res.status(500).json({
        status: "error",
        message: "Failed to reset branding configuration",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
);

export const updateBrandingColors = asyncHandler(
  async (req: Request, res: Response) => {
    const { primaryColor, secondaryColor } = req.body;

    if (!primaryColor || !secondaryColor) {
      return res.status(400).json({ 
        status: "fail", 
        message: "Both primary and secondary colors are required" 
      });
    }

    try {
      const existing = await prisma.brandingConfig.findFirst();
      if (!existing) {
        return res.status(404).json({ 
          status: "fail", 
          message: "No branding configuration found to update" 
        });
      }

      const updated = await prisma.brandingConfig.update({
        where: { id: existing.id },
        data: { 
          primaryColor, 
          secondaryColor 
        },
      });

      return res.status(200).json({
        status: "success",
        message: "Colors updated successfully",
        data: {
          ...updated,
          logoLightUrl: updated.logoLightUrl 
            ? `/images/branding/${updated.logoLightUrl}`
            : null,
          logoDarkUrl: updated.logoDarkUrl 
            ? `/images/branding/${updated.logoDarkUrl}`
            : null
        }
      });
    } catch (error) {
      console.error("Failed to update branding colors:", error);
      return res.status(500).json({
        status: "error",
        message: "Failed to update colors",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
);

// Optional helper function to delete old image files
async function deleteOldImage(filename: string) {
  if (!filename) return;
  
  try {
    const fs = require('fs').promises;
    const imagePath = path.join(
      DESTINANTIONS.IMAGE.BRANDING, 
      filename
    );
    await fs.unlink(imagePath);
  } catch (err) {
    console.error("Failed to delete old image:", err);
  }
}