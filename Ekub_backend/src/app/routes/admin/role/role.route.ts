import express from "express";

import * as RoleController from "../../../controllers/admin/role/role.controler";
import * as StaffAuthMiddleware from "../../../middlewares/staff-auth.middleware";
import { Permissions } from "@prisma/client";
import { check } from "express-validator";
import { validate } from "../../../middlewares/validate.middleware";

const router = express.Router();

router
  .route("/")
  .get(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.role),
    RoleController.getRoles
  )
  .post(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.role),
    [
        check('name').not().isEmpty().withMessage('name is required.'),
        check('description').not().isEmpty().withMessage('description is required.'),
        check('permissions').not().isEmpty().withMessage('permissions is required.'),
        validate
      ],
    RoleController.createRole
  );

router
  .route("/:id")
  .get(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.role),
    RoleController.getRole
  )
  .patch(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.role),
    [
        check('name').not().isEmpty().withMessage('name is required.'),
        check('description').not().isEmpty().withMessage('description is required.'),
        check('permissions').not().isEmpty().withMessage('permissions is required.'),
        validate
      ],
    RoleController.updateRole
  );


export default router;
