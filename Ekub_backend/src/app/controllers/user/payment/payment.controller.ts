import { NextFunction, Request, Response } from "express";

import prisma from "../../../config/db.config";
import { catchAsync } from "../../../config/error.config";
import AppError from "../../../shared/errors/app.error";
import { GetEqubsQueryInterface } from "../../../interfaces/equb.interface";
import {
  DESTINANTIONS,
  FILTERS,
  multerConfig,
  RESOURCES,
} from "../../../config/multer.config";
import {
  getEligibleEqubers,
  getEligibleEqubersForMobile,
} from "../../admin/equb/helper/get-eligible-equbers.helper";
import { calculatePaidAmount } from "../equb/helper/calculate-paid-amount.helper";
import { GetPaymentsQueryInterface } from "../../../interfaces/payment-query.interface";
import { IFilter } from "../../../shared/interfaces/filter.interface";
import {
  createEqubers,
  deleteEquberRequests,
  deleteEquberRequestsOnly,
  PopulatedEquberRequest,
} from "../../admin/payment/helpers/equbber.helper";
import { approveEquberPayments } from "../../admin/payment/helpers/payment.helper";
import { PushNotification } from "../../../shared/notification/services/notification.service";

const upload = multerConfig(
  RESOURCES.PAYMENT,
  DESTINANTIONS.IMAGE.PAYMENT,
  FILTERS.IMAGE
);

/**
 * Upload Middleware
 */
export const uploadImage = {
  pre: upload.single("picture"),
  post: (req: Request, _: Response, next: NextFunction) => {
    console.log("req.file");
    console.log(req.file);
    if (req.file) {
      req.body.picture = req.file.filename;
    }
    next();
  },
};

export const confirmPayment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("got here");

    const { fileName, reference,companyBankAccountId } = req.body;
    console.log(`fileName is ${fileName}`);
    const payment = await prisma.payment.update({
      where: { id: req.params.id },
      data: {
        picture: fileName,
        reference: reference ? reference : "",
        companyBankAccountId: companyBankAccountId,
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

export const getTransactionHistory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as unknown as GetPaymentsQueryInterface;
    const approved = query.approved
      ? query.approved === "true"
        ? true
        : false
      : true;

    console.log("req.user?.id", req.user?.id);
    console.log("query", query);

    let filter: IFilter = {
      userId: req.user?.id,
      approved,
    };

    if (query.equb) {
      filter = {
        ...filter,
        equbId: query.equb,
      };
    }

    if (query.paymentMethod) {
      filter = {
        ...filter,
        paymentMethod: query.paymentMethod,
      };
    }

    // Fetching payments where type is either "equb" or "registering"
    const paymentsMade = await prisma.payment.findMany({
      where: {
        ...filter,
        type: {
          in: ["equb", "registering"],
        },
      },
      select: {
        type: true,
        id: true,
        amount: true,
        paymentMethod: true,
        equb: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
      },
    });

    // Fetching payments where type is "lottery"
    const paymentsReceived = await prisma.payment.findMany({
      where: {
        ...filter,
        type: "lottery",
        equbberUser: {
          userId: req.user?.id,
        },
      },
      select: {
        id: true,
        type: true,
        amount: true,
        paymentMethod: true,
        equb: {
          select: {
            id: true,
            name: true,
          },
        },
        equbberUser: {
          select: {
            calculatedPaidAmount: true,
          },
        },
        createdAt: true,
      },
    });

    // Calculate total amounts for both payments
    const totalPaid = paymentsMade.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    const totalReceived = paymentsReceived.reduce(
      (sum, payment) => sum + (payment.equbberUser?.calculatedPaidAmount || 0),
      0
    );

    // Respond with the data
    res.status(200).json({
      status: "success",
      data: {
        paymentsMade,
        paymentsReceived,
        totalPaid,
        totalReceived,
      },
    });
  }
);

// Notify URL endpoint
export const paymentNotify = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { transactionId, status } = req.body;

    console.log("paymentNotify");

    // Find the payment record by transactionId
    const payment = await prisma.payment.findUnique({
      where: { id: transactionId },
    });

    if (!payment) {
      return next(
        new AppError(`Payment with ID ${transactionId} does not exist`, 404)
      );
    }

    // Update the payment status based on the webhook status
    let approved = false;
    if (status === "success") {
      approved = true;
    }

    await prisma.payment.update({
      where: { id: transactionId },
      data: { approved },
    });

    res.status(200).json({
      status: "success",
      message: "Payment status updated successfully",
    });
  }
);
export const paymentWebhook = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { thirdPartyId, Status, amount, created_at, updated_at } = req.body;

    console.log("Webhook received:", req.body);

    if (!thirdPartyId || !Status) {
      return res.status(400).json({ message: "Invalid webhook data" });
    }

    const payment = await prisma.payment.findUnique({
      where: { transactionId: thirdPartyId },
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
      return res.status(404).json({ message: "Payment not found" });
    }
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
      if (Status === "FAILED") {
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
          `Your request to join ${equbName} was Failed. Please try again`,
          tokens
        );

        // Create Notification
        await prisma.notification.create({
          data: {
            title: "Request Declined",
            body: `Your request to join ${equbName} was Failed. Please try again`,
            userId: payment.userId,
          },
        });
      }
      if (Status === "COMPLETED") {
        const state = Status === "COMPLETED" ? "active" : "inactive";
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            state,
            amount: parseFloat(amount),
            createdAt: new Date(created_at),
            updatedAt: new Date(updated_at),
            picture: "abebe.png",
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

        await createEqubers(equberRequests);
        await deleteEquberRequestsOnly(equberRequests);
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
          `Your request to join ${equbName} has been approved after you successfully pay using SantimPay `,
          tokens
        );

        await prisma.notification.create({
          data: {
            title: "Hagerigna Equb",
            body: `Your request to join ${equbName} has been approved after you successfully pay using SantimPay `,
            userId: payment.userId,
          },
        });
        return res.status(200).json({
          status: "success",
          data: {
            payment,
          },
        });
      }
    }

    if (payment.type === "equb") {
      const equb = await prisma.equb.findUnique({
        where: { id: payment.equbId },
      });
      const equbName = equb?.name ?? "the Equb";
      if (Status === "FAILED") {
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
          `Your payment for ${equbName} was Failed ,please try again.`,
          tokens
        );
        // Create Notification
        await prisma.notification.create({
          data: {
            title: "Payment Declined",
            body: `Your payment for ${equbName} was Failed ,please try again`,
            userId: payment.userId,
          },
        });
      }
      if (Status === "COMPLETED") {
        const state = Status === "COMPLETED" ? "active" : "inactive";

        const updatedPayment = await prisma.payment.update({
          where: { id: payment.id },
          data: {
            state,
            amount: parseFloat(amount),
            createdAt: new Date(created_at),
            updatedAt: new Date(updated_at),
            picture: "abebe.png",
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
          `Your payment for ${updatedPayment.equb?.name} was approved after you pay in santim pay.`,
          tokens
        );

        // Create Notification
        await prisma.notification.create({
          data: {
            title: "Payment Approved",
            body: `Your payment for ${updatedPayment.equb?.name} was approved after you pay in santim pay`,
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

  // // Handle successful payments (e.g., create Equber Request)
  // if (state === "active") {
  //   await prisma.equberRequest.create({
  //     data: {
  //       equbId: payment.equbId,
  //       payments: { connect: { id: payment.id } },
  //       isGruop: false, // or true, depending on your logic
  //     },
  //   });
  // }

  // return res.status(200).json({ message: "Webhook processed successfully" });
);
