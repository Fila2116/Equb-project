// src/app/routes/admin/setting/branding.route.ts

import express from 'express';
import { getBrandingConfig, upsertBrandingConfig } from '../../../controllers/admin/setting/branding.controller';
import {
  resetBrandingConfig,
  updateBrandingColors
} from "../../../controllers/admin/setting/branding.controller";
import * as StaffAuthMiddleware from "../../../middlewares/staff-auth.middleware";
import { Permissions } from "@prisma/client";


const router = express.Router();

router.get('/', getBrandingConfig);
router.post('/', upsertBrandingConfig); // or use `.put` if you prefer
router.delete(
  "/",
  StaffAuthMiddleware.verifyStaff,
  StaffAuthMiddleware.restrictStaff(Permissions.setting),
  resetBrandingConfig
);
router.patch(
  "/color",
  StaffAuthMiddleware.verifyStaff,
  StaffAuthMiddleware.restrictStaff(Permissions.setting),
  updateBrandingColors
);

export default router;
