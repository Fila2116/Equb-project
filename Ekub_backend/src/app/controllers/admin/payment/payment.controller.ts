import { NextFunction, Request, Response } from "express";

import prisma from "../../../config/db.config";
import { catchAsync } from "../../../config/error.config";
import AppError from "../../../shared/errors/app.error";
import { Permissions } from "@prisma/client";

import { QueryInterface } from "../../../shared/interfaces/query.interface";
import { PushNotification } from "../../../shared/notification/services/notification.service";
import { calculatePaidRounds } from "./helpers/calculate-paid-round.helper";
import {
  createEqubers,
  deleteEquberRequests,
  deleteEquberRequestsOnly,
  findExistingGroups,
  PopulatedEquberRequest,
} from "./helpers/equbber.helper";
import { approveEquberPayments } from "./helpers/payment.helper";
import { updateEquberUserPaymentScore } from "../../user/payment/helper/payment-score.helper";
import { updateEquberFinancePoints } from "../../../utils/updateFinancialPoint";
import SMSService from "../../../shared/sms/services/sms.service";
export const getPayments = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as unknown as QueryInterface;

    const page = Number(query._page) || 1;
    const limit = Number(query._limit) || 10;
    const skip = Number((page - 1) * limit);

    const filter = (req as any).filters;
    const sortOrder = (req as any).sortOrder;

    const filterWithPicture = {
      ...filter,
      picture: {
        not: null,
      },
    };
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        //@ts-ignore
      where: filterWithPicture,
        take: limit,
        skip,
        include: {
          equb: {
            select: {
              name: true,
            },
          },
          equbber: {
            include: {
              users: {
                include: {
                  user: {
                    select: {
                      fullName: true,
                    },
                  },
                },
              },
            },
          },
          equberRequests: {
            include: {
              users: {
                include: {
                  user: {
                    select: {
                      fullName: true,
                    },
                  },
                },
              },
            },
          },
          user: true,
        },
        orderBy: sortOrder,
      }),
      prisma.payment.count({
        //@ts-ignore
        where: filterWithPicture,
      }),
    ]);

    res.status(200).json({
      status: "success",
      data: {
        payments,
        meta: {
          page,
          limit,
          total,
        },
      },
    });
  }
);

export const getExportPayments = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    const filter = (req as any).filters;
    const sortOrder = (req as any).sortOrder;
    const filterWithPicture = {
      ...filter,
      picture: {
        not: null,
      },
    };

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        //@ts-ignore
      where: filterWithPicture,
        include: {
          equb: {
            select: {
              name: true,
            },
          },
          equbber: {
            include: {
              users: {
                include: {
                  user: {
                    select: {
                      fullName: true,
                    },
                  },
                },
              },
            },
          },
          equberRequests: {
            include: {
              users: {
                include: {
                  user: {
                    select: {
                      fullName: true,
                    },
                  },
                },
              },
            },
          },
          user: true,
        },
        orderBy: sortOrder,
      }),
      prisma.payment.count({
        //@ts-ignore
        where: filterWithPicture,
      }),
    ]);

    res.status(200).json({
      status: "success",
      data: {
        payments,
        meta: {
          total,
        },
      },
    });
  }
);
export const getPayment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payment = await prisma.payment.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!payment) {
      return next(
        new AppError(`Payment with ID ${req.params.id} does not exist`, 400)
      );
    }

    res.status(200).json({
      status: "success",
      data: {
        payment,
      },
    });
  }
);

export const approvePayment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { approved } = req.body;
    console.log("approving payment");

    const payment = await prisma.payment.findUnique({
      where: { id: req.params.id },
      include: {
        equbber: {
          include: {
            users: {
              include: {
                user: true,
              },
            },
            equb: {
              include: {
                equbCategory: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      return next(
        new AppError(`Payment with ID ${req.params.id} does not exist`, 400)
      );
    }
    console.log("Approved payment", payment);

    if (payment.approved) {
      return next(new AppError(`This payment has been approved.`, 400));
    }
    if (payment.type === "registering") {
      console.log("registering equb");
      const equberRequests = (await prisma.equberRequest.findMany({
        where: {
          payments: {
            some: {
              id: payment.id,
            },
          },
        },
        include: {
          equb: true,
          users: { include: { user: true, payments: true } },
          payments: true,
        },
      })) as unknown as PopulatedEquberRequest[];
      if (!equberRequests) {
        return next(
          new AppError(
            `No Equb Request found with this payment ID ${req.params.id}.`,
            400
          )
        );
      }

      const equberRequest = equberRequests.find((request) =>
        request.payments.some((p) => p.id === payment.id)
      );

      const equbName = equberRequest?.equb?.name ?? "the Equb";

      console.log("equbName", equbName);
      console.log("equberRequest", equberRequest);

      if (approved === "no") {
        await deleteEquberRequests(equberRequests);
        await prisma.payment.delete({ where: { id: payment.id } });
        const user = await prisma.user.findUnique({
          where: { id: payment.userId },
          include: { deviceTokens: true },
        });

        const tokens = user?.deviceTokens.map((token) => token.token);
        console.log("tokens");
        console.log(tokens);
        // @ts-ignore
        await PushNotification.getInstance().sendNotification(
          "Hagerigna Equb",
          `Your request to join ${equbName} was declined by Admin.`,
          tokens
        );
        //send SMS
        await SMSService.sendSms(
          user?.phoneNumber!,
          `Your request to join ${equbName} was declined by Admin.`
        );
        // Create Notification
        await prisma.notification.create({
          data: {
            title: "Request Declined",
            body: `Your request to join ${equbName} was declined by Admin.`,
            userId: payment.userId,
          },
        });

        // const equbs = await prisma.equb.findUnique({
        //   where: { id: payment.equbId! },
        // });
        // await prisma.notification.create({
        //   data: {
        //     title: "Hagerigna Equb",
        //     body: `Your request to join equb is declined by Admin.`,
        //     userId: `${payment.userId}`,
        //   },
        // });
      }
      if (approved === "yes") {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            approved: true,
            staffId: req.staff?.id,
          },
        });
        console.log("userId:", payment.userId);
        console.log("equbId:", payment.equbId);
        await prisma.user.update({
          where: { id: payment.userId },
          data: {
            joinedEqubs: {
              connect: {
                id: payment.equbId,
              },
            },
          },
        });
        await createEqubers(equberRequests);
        await deleteEquberRequestsOnly(equberRequests);
        // finance point
        // await updateEquberFinancePoints(payment.equberId!, payment.id);

        // await prisma.equberRequest.delete({
        //   where: { id: payment.equberRequestId! },
        // });
        const user = await prisma.user.findUnique({
          where: { id: payment.userId },
          include: { deviceTokens: true, joinedEqubs: true },
        });
        const equb = user?.joinedEqubs.find((eq) => eq.id === payment.equbId);
        const equbName = equb?.name || "the Equb";

        const tokens = user?.deviceTokens.map((token) => token.token) || [];
        console.log("Notification tokens:", tokens);
        // @ts-ignore
        await PushNotification.getInstance().sendNotification(
          "Hagerigna Equb",
          `Your request to join ${equbName} has been approved by Admin.`,
          tokens
        );
        //send SMS
        await SMSService.sendSms(
          user?.phoneNumber!,
          `Your request to join ${equbName} has been approved by Admin.`
        );

        await prisma.notification.create({
          data: {
            title: "Hagerigna Equb",
            body: `Your request to join ${equbName} has been approved by Admin.`,
            userId: payment.userId,
          },
        });
      }

      return res.status(200).json({
        status: "success",
        data: {
          payment,
        },
      });
    }
    if (payment.type === "equb") {
      console.log("equb.....");

      const equb = await prisma.equb.findUnique({
        where: { id: payment.equbId },
      });
      const equbName = equb?.name ?? "the Equb";
      if (approved === "no") {
        // await deleteEquberRequests(equberRequests)
        await prisma.payment.delete({ where: { id: payment.id } });
        const user = await prisma.user.findUnique({
          where: { id: payment.userId },
          include: { deviceTokens: true, joinedEqubs: true },
        });
        const tokens = user?.deviceTokens.map((token) => token.token);
        console.log("tokens");
        console.log(tokens);
        // @ts-ignore
        await PushNotification.getInstance().sendNotification(
          "Hagerigna Equb",
          `Your payment for ${equbName} was declined by Admin.`,
          tokens
        );
        //send SMS
        await SMSService.sendSms(
          user?.phoneNumber!,
          `Your payment for ${equbName} was declined by Admin.`
        );
        // Create Notification
        await prisma.notification.create({
          data: {
            title: "Payment Declined",
            body: `Your payment for ${equbName} was declined by Admin.`,
            userId: payment.userId,
          },
        });
      }
      if (approved === "yes") {
        const updatedPayment = await prisma.payment.update({
          where: { id: payment.id },
          data: {
            approved: true,
            staffId: req.staff?.id,
          },
          include: {
            equberUserPayments: true,
            equb: true,
            user: { include: { equberUsers: true } },
          },
        });

        await approveEquberPayments(updatedPayment.equberUserPayments);

        const user = await prisma.user.findUnique({
          where: { id: payment.userId },
          include: { deviceTokens: true },
        });

        const tokens = user?.deviceTokens.map((token) => token.token);
        console.log("tokens");
        console.log(tokens);
        // @ts-ignore
        // Send Push Notification
        await PushNotification.getInstance().sendNotification(
          "Hagerigna Equb",
          `Your payment for ${updatedPayment.equb?.name} was approved by Admin.`,
          tokens
        );

        //send SMS
        await SMSService.sendSms(
          user?.phoneNumber!,
          `Your payment for ${updatedPayment.equb?.name} was approved by Admin.`
        );

        // Create Notification
        await prisma.notification.create({
          data: {
            title: "Payment Approved",
            body: `Your payment for ${updatedPayment.equb?.name} was approved by Admin.`,
            userId: payment.userId,
          },
        });
      }

      return res.status(200).json({
        status: "success",
        data: {
          payment,
        },
      });
    }
  }
);

export const getPendingPayments = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payments = await prisma.payment.findMany({
      where: {
        approved: false,
      },
    });

    const pendingPaymentsCount = await prisma.payment.count({
      where: {
        approved: false,
        picture: {
          not: null,
        },
      },
    });

    if (!payments || payments.length === 0) {
      return next(new AppError(`No pending payments found`, 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        // payments,
        count: pendingPaymentsCount,
      },
    });
  }
);
