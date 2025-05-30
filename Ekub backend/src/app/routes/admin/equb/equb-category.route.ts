import express from "express";

import * as EqubCategory from "../../../controllers/admin/equb/equb-category.controller";
import * as StaffAuthMiddleware from "../../../middlewares/staff-auth.middleware";
import { Permissions } from "@prisma/client";
import { check } from "express-validator";
import { validate } from "../../../middlewares/validate.middleware";

const router = express.Router();

router
  .route("/")
  .get(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.equb_category),
    EqubCategory.getEqubCategories
  )
  .post(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.equb_category),
    [
        check('name').not().isEmpty().withMessage('name is required.'),
        check('hasReason').isIn(['yes', 'no']).withMessage('hasReason must be either "yes" or "no"'),
        check('needsRequest').isIn(['yes', 'no']).withMessage('needsRequest must be either "yes" or "no"'),
        validate
      ],
    EqubCategory.createEqubCategory
  );

router
  .route("/:id")
  .get(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.equb_category),
    EqubCategory.getEqubCategory
  )
  .patch(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.equb_category),
    [
        check('name').not().isEmpty().withMessage('name is required.'),
        check('hasReason').isIn(['yes', 'no']).withMessage('hasReason must be either "yes" or "no"'),
        check('needsRequest').isIn(['yes', 'no']).withMessage('needsRequest must be either "yes" or "no"'),
        validate
      ],
    EqubCategory.updateEqubCategory
  );


export default router;
