import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../../config/error.config";
import prisma from "../../../config/db.config";
import SMSService from "../../../shared/sms/services/sms.service";

export const sendBulkSms = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // const users = await prisma.user.findMany({
    //   select: {
    //     phoneNumber: true,
    //   },
    // });
    // const phoneNumber = users
    //   .map((user) => user.phoneNumber)
    //   .filter(Boolean) as string[];

    // const message = req.body.message;
    // if (!phoneNumber || !message) {
    //   return res
    //     .status(400)
    //     .json({ error: "phoneNumber and message are required" });
    // }

    const { phoneNumber, message } = req.body;

    const response = await SMSService.sendBulkSms(phoneNumber, message);

    res.status(200).json({ success: true, data: response });
  }
);
