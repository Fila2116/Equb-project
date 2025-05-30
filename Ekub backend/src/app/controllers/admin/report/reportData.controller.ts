import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../../../config/error.config";
import prisma from "../../../config/db.config";
import AppError from "../../../shared/errors/app.error";
import { structuredEqubers } from "../../user/report/helpers/equber.helper";
import { PopulatedEqub } from "../../user/equb/helper/payment.helper";

// General Report
export const generalReport = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // const payments = await prisma.payment.findMany({
    //   include: {
    //     equb: true,
    //     user: true,
    //     equbber: true,
    //   },
    // });

    const payments = await prisma.payment.findMany({
      select: {
        equb: {
          select: {
            name: true,
            equbAmount: true,
          },
        },
        user: {
          select: {
            username: true,
            email: true,
            phoneNumber: true,
          },
        },
        equbber: {
          select: {
            lotteryNumber: true,
            paidRound: true,
          },
        },
        id: true,
        type: true,
        amount: true,
        approved: true,
      },
    });
    const groupedPayments = payments.reduce((acc, payment) => {
      if (!acc[payment.type]) acc[payment.type] = [];
      acc[payment.type].push(payment);
      return acc;
    }, {} as Record<string, any[]>);

    res.status(200).json({ success: true, data: groupedPayments });
  }
);

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

    if (!equb) {
      return next(
        new AppError(`Equb with ID ${req.params.id} does not exist`, 400)
      );
    }

    const userId = req.user?.id;

    // Ensuring equb is not null and passing it safely to structuredEqubers
    const report = {
      equbName: equb.name,
      equbType: equb.equbType,
      equbers: structuredEqubers(equb, userId!), // Now equb is guaranteed to be non-null
    };

    res.status(200).json({ success: true, data: report });
  }
);

// User-Specific Report
export const SpecificReport = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    const userPayments = await prisma.payment.findMany({
      where: { userId },
      include: {
        equb: true,
        equbber: true,
      },
    });

    res.status(200).json({ success: true, data: userPayments });
  }
);
