// src/app/routes/admin/setting/branding.route.ts

import express from "express";
import {
  getBrandingConfig,
  upsertBrandingConfig,
  uploadBrandingImages,
  resetBrandingConfig,
  updateBrandingColors,
} from "../../../controllers/admin/setting/branding.controller";

import * as StaffAuthMiddleware from "../../../middlewares/staff-auth.middleware";
import { Permissions } from "@prisma/client";

const router = express.Router();

router.get("/", getBrandingConfig);

router.put("/", uploadBrandingImages, upsertBrandingConfig);

router.delete(
  "/",
  StaffAuthMiddleware.verifyStaff,
  StaffAuthMiddleware.restrictStaff(Permissions.staff),
  resetBrandingConfig
);

router.patch(
  "/color",
  StaffAuthMiddleware.verifyStaff,
  StaffAuthMiddleware.restrictStaff(Permissions.staff),
  updateBrandingColors
);

export default router;
