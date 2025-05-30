import express from "express";
import { check } from "express-validator";
import { validate } from "../../../middlewares/validate.middleware";
import { sendBulkSms } from "../../../controllers/admin/sms/sms.controller";

const router = express.Router();

// Validation middleware for SMS API
router.post(
  "/",
  [check("message").notEmpty().withMessage("Message is required")],
  validate, // Middleware to handle validation errors
  sendBulkSms
);

export default router;
