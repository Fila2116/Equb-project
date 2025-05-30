import express from "express";

import * as Branch from "../../../controllers/admin/branch/branch.controller";
import * as StaffAuthMiddleware from "../../../middlewares/staff-auth.middleware";
import { Permissions } from "@prisma/client";
import { check } from "express-validator";
import { validate } from "../../../middlewares/validate.middleware";

const router = express.Router();

router
  .route("/")
  .get(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.branch),
    Branch.getBranches
  )
  .post(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.branch),
    [
        check('name').not().isEmpty().withMessage('name is required.'),
        check('city').not().isEmpty().withMessage('city is required.'),
        check('phoneNumber').optional().isLength({ min: 10 ,max:14}).withMessage('Phone number must be at least 10 digits.'),
        validate
      ],
    Branch.createBranch
  );
  
 
router
  .route("/:id")
  .get(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.branch),
    Branch.getBranch
  )
  .patch(
    StaffAuthMiddleware.verifyStaff,
    StaffAuthMiddleware.restrictStaff(Permissions.branch),
    [
        check('name').not().isEmpty().withMessage('name is required.'),
        check('city').not().isEmpty().withMessage('city is required.'),
        check('phoneNumber').optional().isLength({ min: 10 ,max:14}).withMessage('Phone number must be at least 10 digits.'),
        validate
      ],
    Branch.updateBranch
  );


export default router;
