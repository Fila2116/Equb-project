import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../../../config/error.config";
import prisma from "../../../config/db.config";
import AppError from "../../../shared/errors/app.error";
import {
  PopulatedEqub,
  structuredPayment,
} from "../equb/helper/payment.helper";
import { structuredEqubers } from "./helpers/equber.helper";

export const getReport = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const equb = (await prisma.equb.findUnique({
      where: { id: req.params.id },
      include: {
        equbType: true,
        equbers: {
          include: {
            payments: true,
            users: {
              include: {
                user: true,
                payments: true,
                guaranteeUser: true,
                guarantee: true,
              },
            },
          },
        },
      },
    })) as unknown as PopulatedEqub;
    console.log("userId", req.user?.id);
    if (!equb) {
      return next(
        new AppError(`Equb with ID ${req.params.id} does not exist`, 400)
      );
    }

    const userId = req.user?.id;
    const report = {
      equbName: equb.name,
      equbType: equb.equbType,
      equbers: structuredEqubers(equb, userId!),
    };

    res.status(200).json({
      status: "success",
      data: report,
    });
  }
);
