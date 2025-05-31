import express from "express";

import * as EqubType from "../../../controllers/admin/equb/equb-type.controller";
import * as StaffAuthMiddleware from "../../../middlewares/staff-auth.middleware";
import { Permissions } from "@prisma/client";
import { check } from "express-validator";
import { validate } from "../../../middlewares/validate.middleware";

const router = express.Router();

router
  .route("/")
  .get(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.equb_type),
    EqubType.getEqubTypes
  )
  .post(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.equb_type),
    [
        check('name').not().isEmpty().withMessage('name is required.'),
        check('interval').isInt().withMessage('interval is required in number.'),
        validate
      ],
    EqubType.createEqubType
  );

  
router
  .route("/:id")
  .get(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.equb_type),
    EqubType.getEqubType
  )
  .patch(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.equb_type),
    [
        check('name').not().isEmpty().withMessage('name is required.'),
        check('interval').isInt().withMessage('interval is required in number.'),
        validate
      ],
    EqubType.updateEqubType
  );


export default router;
