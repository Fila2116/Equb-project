import express from 'express';
import deviceTokenController from '../../../controllers/user/device-token/device-token.controller';
import * as UserAuthMiddleware from "../../../middlewares/user-auth.middleware";
import { validate } from '../../../middlewares/validate.middleware';
import { check } from 'express-validator';



const router = express.Router(); 


router.post(
  '/',
  [
    check('token').not().isEmpty().withMessage('token is required.'),

  ],
  validate,
  UserAuthMiddleware.verifyUser,
  deviceTokenController.createDeviceToken
);
export default router;