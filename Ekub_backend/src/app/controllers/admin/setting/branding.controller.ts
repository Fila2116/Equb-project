// src/app/controllers/admin/setting/branding.controller.ts

import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import asyncHandler from '../../../middlewares/asyncHandler';



const prisma = new PrismaClient();

export const getBrandingConfig = async (_req: Request, res: Response) => {
  try {
    const config = await prisma.brandingConfig.findFirst();
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch branding config' });
  }
};

export const upsertBrandingConfig = async (req: Request, res: Response) => {
  const { logoLightUrl, logoDarkUrl, primaryColor, secondaryColor, defaultDarkMode } = req.body;

  try {
    const existing = await prisma.brandingConfig.findFirst();

    const config = existing
      ? await prisma.brandingConfig.update({
          where: { id: existing.id },
          data: { logoLightUrl, logoDarkUrl, primaryColor, secondaryColor, defaultDarkMode },
        })
      : await prisma.brandingConfig.create({
          data: { logoLightUrl, logoDarkUrl, primaryColor, secondaryColor, defaultDarkMode },
        });

    return res.json(config);
  } catch (error) {
    console.error("💥 Branding upsert error:", error);
    return res.status(500).json({ error: 'Failed to upsert branding config' });
  }
};

export const resetBrandingConfig = asyncHandler(async (req:Request, res:Response) => {
  try {
    await prisma.brandingConfig.deleteMany({});
    return res.status(200).json({ status: 'success', message: 'Branding config reset to defaults' });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Failed to reset branding config' });
  }
});


export const updateBrandingColors = asyncHandler(async (req: Request, res: Response) => {
  const { primaryColor, secondaryColor } = req.body;

  if (!primaryColor || !secondaryColor) {
    return res.status(400).json({ status: 'fail', message: 'Both colors are required' });
  }

  try {
    const existing = await prisma.brandingConfig.findFirst();
    if (!existing) {
      return res.status(404).json({ status: 'fail', message: 'No branding config found' });
    }

    const updated = await prisma.brandingConfig.update({
      where: { id: existing.id },
      data: { primaryColor, secondaryColor }
    });

    return res.status(200).json({ status: 'success', data: updated });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Failed to update colors' });
  }
});


