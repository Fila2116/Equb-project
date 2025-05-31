import express from "express";

import * as BannerController from "../../../controllers/admin/banner/banner.controller";
import * as StaffAuthMiddleware from "../../../middlewares/staff-auth.middleware";
import { Permissions, State } from "@prisma/client";
import { body, check } from "express-validator";
import { validate } from "../../../middlewares/validate.middleware";

const router = express.Router();

router
  .route("/")
  .get(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.banner),
    BannerController.getBanners
  )
  .post(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.banner),
    BannerController.uploadImage.pre,
    [
        body('validFrom').not().isEmpty().withMessage('validFrom is required.'),
        body('validUntil').not().isEmpty().withMessage('validUntil is required.'),
        body('state').isIn([State.active, State.inactive,State.deleted]).withMessage(`Valid state values are ${State.active} and ${State.inactive}`),
        validate
      ],
    BannerController.createBanner
  );

router
  .route("/:id")
  .get(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.banner),
    BannerController.getBanner
  )
  .patch(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.banner),
    [
        check('name').not().isEmpty().withMessage('name is required.'),
        validate
      ],
    BannerController.updateBanner
  );
router
  .route("/deleteBanner/:id")
  .delete(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.user),
    BannerController.deleteBanner
  );


export default router;
