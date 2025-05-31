// src/app/routes/admin/setting/index.route.ts (example)

import express from 'express';
import brandingRoute from './branding.route';
import { Permissions } from '@prisma/client';
import * as StaffAuth from '../../../middlewares/staff-auth.middleware';
import brandingUploadRoute from './branding-upload.route';

const router = express.Router();

router.use(
  '/branding-config/upload',
  StaffAuth.verifyStaff,
  StaffAuth.restrictStaff(Permissions.setting),
  brandingUploadRoute
);

router.use(
  '/branding-config',
  StaffAuth.verifyStaff,
  StaffAuth.restrictStaff(Permissions.setting),
  brandingRoute
);



export default router;


