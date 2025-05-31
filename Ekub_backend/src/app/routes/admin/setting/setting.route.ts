import express from "express";

import * as SettingController from "../../../controllers/admin/setting/setting.controller";
import * as StaffAuthMiddleware from "../../../middlewares/staff-auth.middleware";
import { Permissions, SettingType, SettingTypeValue } from "@prisma/client";
import { check } from "express-validator";
import { validate } from "../../../middlewares/validate.middleware";

const router = express.Router();

router
  .route("/")
  .get(
    // StaffAuthMiddleware.verifyStaff,
    // StaffAuthMiddleware.restrictStaff(Permissions.setting),
    SettingController.getSettings
  )
  .post(
    // StaffAuthMiddleware.verifyStaff,
    // StaffAuthMiddleware.restrictStaff(Permissions.setting),
    [
      check('name').isIn([SettingType.notificationTime]).withMessage(`Valid setting names are ${SettingType.notificationTime} `),
      // check('value').isIn([SettingTypeValue.booleanValue, SettingTypeValue.numericValue,SettingTypeValue.validFrom,SettingTypeValue.validUntil]).withMessage(`Valid setting value types are ${SettingTypeValue.numericValue}, ${SettingTypeValue.booleanValue}, ${SettingTypeValue.validFrom} and ${SettingTypeValue.validUntil}.`),
        validate
      ],
    SettingController.createSetting
  );

  router
  .route("/types")
  .get(
    // StaffAuthMiddleware.verifyStaff,
    // StaffAuthMiddleware.restrictStaff(Permissions.setting),
    SettingController.getSettingTypes
  )

  router
  .route("/value-types")
  .get(
    // StaffAuthMiddleware.verifyStaff,
    // StaffAuthMiddleware.restrictStaff(Permissions.setting),
    SettingController.getSettingValueTypes
  )
  
router
  .route("/:id")
  .get(
    // StaffAuthMiddleware.verifyStaff,
    // StaffAuthMiddleware.restrictStaff(Permissions.setting),
    SettingController.getSetting
  )
  .patch(
    // StaffAuthMiddleware.verifyStaff,
    // StaffAuthMiddleware.restrictStaff(Permissions.setting),
    [
        check('name').isIn([SettingType.notificationTime]).withMessage(`Valid setting names are ${SettingType.notificationTime} `),
        // check('value').isIn([SettingTypeValue.booleanValue, SettingTypeValue.numericValue,SettingTypeValue.validFrom,SettingTypeValue.validUntil]).withMessage(`Valid setting value types are ${SettingTypeValue.numericValue}, ${SettingTypeValue.booleanValue}, ${SettingTypeValue.validFrom} and ${SettingTypeValue.validUntil}.`),
        validate
      ],
    SettingController.updateSetting
  ).delete(
    // StaffAuthMiddleware.verifyStaff,
    // StaffAuthMiddleware.restrictStaff(Permissions.setting),
    SettingController.deleteSetting
  );


export default router;
