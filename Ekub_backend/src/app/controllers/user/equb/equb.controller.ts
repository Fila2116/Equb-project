import { NextFunction, Request, Response } from "express";

import prisma from "../../../config/db.config";
import { catchAsync } from "../../../config/error.config";
import AppError from "../../../shared/errors/app.error";
import {
  GetEqubsQueryInterface,
  GetMyEqubPaymentsQueryInterface,
} from "../../../interfaces/equb.interface";
import { PushNotification } from "../../../shared/notification/services/notification.service";
import {
  DESTINANTIONS,
  FILTERS,
  multerConfig,
  RESOURCES,
} from "../../../config/multer.config";
import { calculatePaidAmount } from "./helper/calculate-paid-amount.helper";
import {
  getEligibleEqubers,
  getEligibleEqubersForMobile,
  getEligibleEqubersForMobileWithRequest,
} from "../../admin/equb/helper/get-eligible-equbers.helper";
import { Equb, EquberUser } from "@prisma/client";
import { log } from "console";
import { create } from "domain";
import {
  equbersPaid,
  PopulatedEqub,
  structuredPayment,
} from "./helper/payment.helper";
import {
  getLotteryAmount,
  getNetLotteryAmount,
} from "./helper/get-lottery-amount.helper";
import SMSService from "../../../shared/sms/services/sms.service";
import { Payload } from "@prisma/client/runtime/library";
import { IPayload } from "../../../shared/notification/interfaces/payload.interface";
import { WebSocketService } from "../../../shared/web-socket/services/web-socket.service";
import { EventNames } from "../../../shared/web-socket/enums/event-name.enum";
import { SantimpaySdk } from "../../../lib/santim_pay";
import { PRIVATE_KEY_IN_PEM } from "../../../lib/santim_pay/utils/constants";

const upload = multerConfig(
  RESOURCES.PAYMENT,
  DESTINANTIONS.IMAGE.PAYMENT,
  FILTERS.IMAGE
);

const guaranteeUpload = multerConfig(
  RESOURCES.GUARANTEE,
  DESTINANTIONS.IMAGE.GUARANTEE,
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

/**
 * Upload Middleware
 */
export const uploadGuaranteeImage = {
  pre: guaranteeUpload.single("picture"),
  post: (req: Request, _: Response, next: NextFunction) => {
    console.log("req.file");
    console.log(req.file);
    if (req.file) {
      req.body.picture = req.file.filename;
    }
    next();
  },
};

export const getEqubs = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as unknown as GetEqubsQueryInterface;

    const branchId = query.branch;
    const page = Number(query._page) || 1;
    const limit = Number(query._limit) || 11;
    const skip = Number((page - 1) * limit);
    //       const filter = (req as any).filter || {};
    // req.filters = req.query;
    // let filters: any = {};
    // let sortOrder: any = {};
    // if (query.sortBy) {
    //   if (query.sortBy === "newest") {
    //     sortOrder = { nextRoundDate: "desc" };
    //   } else if (query.sortBy === "oldest") {
    //     sortOrder = { nextRoundDate: "asc" };
    //   }
    // }

    // (req as any).sortOrder = sortOrder;
    // if (query._search) {
    //   filters.name = {
    //     contains: query._search,
    //     mode: "insensitive",
    //   };
    // }

    let { filters } = req;

    // console.log("Constructed req:", req.filters);

    // console.log(sortOrder);

    const [equbs, total] = await Promise.all([
      prisma.equb.findMany({
        where: filters,
        include: {
          equbType: {
            select: {
              id: true,
              name: true,
            },
          },
          Payment: true,
          equbCategory: {
            select: {
              id: true,
              name: true,
              needsRequest: true,
              isSaving: true,
            },
          },
          equbers: {
            select: { id: true, lotteryNumber: true },
          },
          branch: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        take: limit,
        skip,
      }),
      prisma.equb.count({
        where: filters,
      }),
    ]);

    res.status(200).json({
      status: "success",
      data: {
        equbs,
        meta: {
          page,
          limit,
          total,
        },
      },
    });
  }
);
export const getMyPendingEqubs = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as unknown as GetEqubsQueryInterface;

    const branchId = query.branch;
    const page = Number(query._page) || 1;
    const limit = Number(query._limit) || 11;
    const skip = Number((page - 1) * limit);
    console.log("req.filters");
    console.log(req.filters);

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: {
          type: "registering",
          approved: false,
          userId: req.user?.id,
        },
        include: {
          equb: {
            select: {
              id: true,
              name: true,
            },
          },
          equberUserPayments: true,
        },
        take: limit,
        skip,
      }),
      prisma.payment.count({
        where: {
          type: "registering",
          approved: false,
          userId: req.user?.id,
        },
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
export const getEqub = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const equb = await prisma.equb.findUnique({
      where: {
        id: req.params.id,
      },
      include: {
        equbType: {
          select: {
            id: true,
            name: true,
          },
        },
        equbCategory: {
          select: {
            id: true,
            name: true,
            isSaving: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!equb) {
      return next(
        new AppError(`Equb with ID ${req.params.id} does not exist`, 400)
      );
    }

    res.status(200).json({
      status: "success",
      data: {
        equb,
      },
    });
  }
);

export const getUserEqub = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userEqub = await prisma.user.findUnique({
      where: {
        id: req.params.userId,
      },
      include: {
        joinedEqubs: {
          include: {
            equbType: {
              select: {
                id: true,
                name: true,
              },
            },
            equbCategory: {
              select: {
                id: true,
                name: true,
                isSaving: true,
              },
            },
            branch: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
    console.log("userEqub", userEqub);
    if (!userEqub) {
      return next(
        new AppError(`user with ID ${req.params.id} does not exist`, 400)
      );
    }

    res.status(200).json({
      status: "success",
      data: {
        userEqub,
      },
    });
  }
);

export const getEqubPayments = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const equb = (await prisma.equb.findUnique({
      where: {
        id: req.params.id,
      },
      include: {
        equbers: {
          include: {
            users: {
              include: {
                user: {
                  select: {
                    id: true,
                    fullName: true,
                  },
                },
              },
            },
            payments: true,
            lotteryRequest: true,
          },
        },
      },
    })) as unknown as PopulatedEqub;

    if (!equb) {
      return next(
        new AppError(`Equb with ID ${req.params.id} does not exist`, 400)
      );
    }

    // return res.json({equbers:equb.equbers})
    res.status(200).json({
      status: "success",
      data: {
        equbRound: equb.currentRound,
        equbersPaid: equbersPaid(equb),
        equbers: equb.equbers.length,
        payments: structuredPayment(equb, req.user?.id!),
      },
    });
  }
);
export const getEqubLotteries = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const equb = await prisma.equb.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!equb) {
      return next(
        new AppError(`Equb with ID ${req.params.id} does not exist`, 400)
      );
    }
    const equbMembers = await prisma.equber.findMany({
      where: {
        equbId: req.params.id,
        hasWonEqub: true,
      },
      include: {
        users: {
          include: { user: true, guarantee: true },
        },
      },
    });

    res.status(200).json({
      status: "success",
      data: {
        lotteries: equbMembers.map((equbMember) => ({
          users: equbMember.users.map((equbUser) => {
            return {
              lotteryNumber: equbMember.lotteryNumber,
              equberUserId: equbUser.id,
              userId: equbUser.user.id,
              hasGuarantee:
                Boolean(equbUser.guaranteeId) ||
                Boolean(equbUser.guaranteeUserId),
              totalLotteryAmount: getLotteryAmount(equb, equbUser.stake),
              netLotteryAmount: getNetLotteryAmount(equb, equbUser.stake),
              hasClaimed: equbUser.hasClaimed,
              hasTakenEqub: equbUser.hasTakenEqub,
              userFullName: equbMember.isGruop
                ? "Group"
                : equbMember.users[0].user.fullName,
              round: equbMember.winRound,
            };
          }),
        })),
      },
    });
  }
);
export const getEqubLottery = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const equb = await prisma.equb.findUnique({
      where: {
        id: req.params.id,
      },
      include: {
        equbCategory: true,
      },
    });

    if (!equb) {
      return next(
        new AppError(`Equb with ID ${req.params.id} does not exist`, 400)
      );
    }

    console.log("equb.hasLastRoundWinner", equb.hasLastRoundWinner);
    if (equb.hasLastRoundWinner) {
      const equbMembers = await prisma.equber.findMany({
        where: {
          equbId: req.params.id,
        },
        include: {
          users: {
            include: { user: true },
          },
          lotteryRequest: true,
        },
      });

      console.log(
        "equbMembers",
        equbMembers.map((lotteryNum) => lotteryNum.lotteryNumber)
      );
      const equbIsSpecial = equb.equbCategory.needsRequest;
      let eligibleMembers: any[] = [];
      if (equbIsSpecial) {
        console.log("Special Equb");
        console.log(equb.nextRoundLotteryType);
        eligibleMembers =
          equb.nextRoundLotteryType === "request"
            ? await getEligibleEqubersForMobile(
              equbMembers,
              equb.previousRound,
              equb.equbAmount
            )
            : await getEligibleEqubersForMobileWithRequest(
              equbMembers,
              equb.previousRound,
              equb.equbAmount
            );
      } else {
        console.log("Financial Equb");
        console.log("equb.previousRound from user/equb", equb.previousRound);
        eligibleMembers = await getEligibleEqubersForMobile(
          equbMembers,
          equb.previousRound,
          equb.equbAmount
        );
      }
      console.log("eligibleMembers length", eligibleMembers.length);

      const equbEligibleMembers = await getEligibleEqubers(
        equbMembers,
        equb.previousRound,
        equb.equbAmount
      );
      const currentRoundWinners = await prisma.equber.findMany({
        where: {
          equbId: req.params.id,
          winRound: equb.previousRound,
        },
        include: {
          users: {
            include: { user: true },
          },
        },
      });
      WebSocketService.getInstance().publish(
        EventNames.EQUB_ElIGIBLE,
        {
          eligibleMembers,
          currentRoundWinners,
          equbEligibleMembers,
        },
        req.params.id
      );

      return res.status(200).json({
        status: "success",
        data: {
          eligibleMembers,
          currentRoundWinners,
          equbEligibleMembers,
        },
      });
    } else {
      return res.status(200).json({
        status: "success",
        data: {
          eligibleMembers: [],
          currentRoundWinners: [],
          equbEligibleMembers: [],
        },
      });
    }
  }
);


export const joinEqub = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("got here");
    console.log(req.body);

    const { paidAmount, equbers, paymentMethod, picture, phoneNumber } =
      req.body;

    if (!paidAmount || !equbers || !paymentMethod) {
      return next(
        new AppError("Missing required fields in request body.", 400)
      );
    }

    const equb = await prisma.equb.findUnique({
      where: { id: req.params.id },
    });

    if (!equb) {
      return next(
        new AppError(`Equb with ID ${req.params.id} does not exist`, 400)
      );
    }

    if (!req.user?.id) {
      return next(new AppError("User not authenticated", 401));
    }

    console.log("User", req.user?.id);

    const client = new SantimpaySdk(
      process.env.GATEWAY_MERCHAT_ID!,
      PRIVATE_KEY_IN_PEM!
    );

    const successRedirectUrl = "http://dashboard.hageregnaequb.com/dashboard/home";
    const failureRedirectUrl = "http://dashboard.hageregnaequb.com/dashboard/payment";
    const cancelRedirectUrl = "http://api.hageregnaequb.com/";
    const notifyUrl =
      "https://api.hageregnaequb.com/api/v1/user/payment/notify";

    const transactionId = Math.floor(Math.random() * 1000000000).toString();

    // Declare payment outside so it's accessible
    let payment: any = null;
    let checkoutUrl: string | null = null;

    console.log("Payment data:", {
      type: "registering",
      paymentMethod,
      amount: paidAmount,
      round: 1,
      equbId: equb.id,
      userId: req.user?.id!,
      picture: picture || null,
      state: "inactive",
      transactionId,
    });

    console.log("paymentMethod", paymentMethod);

    if (paymentMethod === "santimpay") {
      payment = await prisma.payment.create({
        data: {
          type: "registering",
          paymentMethod,
          amount: 0,
          round: 1,
          equbId: equb.id,
          userId: req.user?.id!,
          picture: picture || null,
          state: "inactive",
          transactionId,
        },
      });

      // checkoutUrl = await client.generatePaymentUrl(
      //   transactionId,
      //   paidAmount,
      //   "Payment for joining Equb",
      //   successRedirectUrl,
      //   failureRedirectUrl,
      //   notifyUrl,
      //   phoneNumber,
      //   cancelRedirectUrl
      // );

      console.log("checkoutUrl", checkoutUrl);
    } else {
      payment = await prisma.payment.create({
        data: {
          type: "registering",
          paymentMethod,
          amount: paidAmount,
          round: 1,
          equbId: equb.id,
          userId: req.user?.id!,
          picture: picture || null,
          state: "inactive",
          transactionId,
        },
      });

      console.log("payment in bank method", payment);
    }

    if (!payment || !payment.id) {
      return next(new AppError("Payment creation failed", 500));
    }

    let equbRequests: any = [];
    async function iterateEachEquber(equb: Equb): Promise<void> {
      await Promise.all(
        equbers.map(async (equber: any) => {
          const stake = equber.stake;
          const paidAmount = equber.paidAmount;

          const equberRequest = await prisma.equberRequest.create({
            data: {
              equbId: equb.id,
              isGruop: stake !== 100,
              users: {
                create: [
                  {
                    userId: req.user?.id!,
                    stake,
                    totalPaid: paidAmount,
                    payments: payment?.id
                      ? {
                        create: {
                          amount: paidAmount,
                          payment: {
                            connect: { id: payment.id },
                          },
                        },
                      }
                      : undefined, // Avoid connecting `undefined` ID
                  },
                ],
              },
              payments: payment?.id
                ? { connect: { id: payment.id } }
                : undefined, // Avoid connecting `undefined` ID
            },
            include: {
              users: {
                include: {
                  user: true,
                  payments: true,
                },
              },
              payments: true,
            },
          });

          equbRequests.push(equberRequest);
        })
      );
    }

    await iterateEachEquber(equb);

    res.status(200).json({
      status: "success",
      data: {
        equbRequests,
        checkoutUrl,
      },
    });
  }
);

export const setGuarantee = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("req.body");
    console.log(req.body);
    const { firstName, lastName, phoneNumber, fileName } = req.body;
    console.log(`File name: ${fileName}`);

    // Updated regex to match phone numbers starting with +251 followed by 9 digits
    const phoneRegex = /^\+251\d{9}$/;

    if (!firstName || !lastName || !phoneNumber || !fileName) {
      return next(
        new AppError("Missing required fields in request body.", 400)
      );
    }

    if (!phoneRegex.test(phoneNumber)) {
      return next(
        new AppError(
          "Invalid phone number format. Must start with +251 and be followed by 9 digits.",
          400
        )
      );
    }

    let equberUser = await prisma.equberUser.findFirst({
      where: {
        id: req.params.id,
      },
    });
    if (!equberUser) {
      return next(
        new AppError(`There is no Equber user with Id ${req.params.id} .`, 400)
      );
    }
    const guarantee = await prisma.guarantee.create({
      data: {
        firstName: firstName,
        lastName: lastName,
        fullName: `${firstName} ${lastName}`,
        phoneNumber: phoneNumber,
        picture: fileName ? fileName : null,
      },
    });
    equberUser = await prisma.equberUser.update({
      where: { id: equberUser.id },
      data: {
        guaranteeId: guarantee.id,
      },
    });

    res.status(200).json({
      status: "success",
      data: {
        guarantee,
      },
    });
  }
);

export const getGuarantee = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userEqubData = await prisma.equberUser.findUnique({
      where: {
        id: req.params.id,
      },
      include: {
        user: true,
      },
    });

    // If equberUser is not found
    if (!userEqubData) {
      return next(
        new AppError(`No Equber User found with ID ${req.params.id}.`, 404)
      );
    }

    // If no guaranteeId is set for the user
    if (!userEqubData.guaranteeUserId) {
      return next(new AppError(`This user has no guarantee set.`, 400));
    }

    const guarantee = await prisma.user.findUnique({
      where: {
        id: userEqubData.guaranteeUserId!,
      },
    });

    // If guarantee is not found
    if (!guarantee) {
      return next(
        new AppError(
          `No Guarantee found with ID ${userEqubData.guaranteeId}.`,
          404
        )
      );
    }

    return res.status(200).json({
      status: "success",
      data: {
        userEqubData,
        guarantee,
      },
    });
  }
);

export const saveGuarantee = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId ,guaranteToBe} = req.body;
    console.log("guaranteToBe....",guaranteToBe);
    console.log("userId....",userId);

    let user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        deviceTokens: true,
      },
    });
    console.log(" req.user?.id", req.user?.id);

    if (!user) {
      return next(new AppError(`There is no  user with Id ${userId} .`, 400));
    }
    if (user.id === req.user?.id) {
      return next(
        new AppError(`You can not choose yourself as a guarantee.`, 400)
      );
    }
    const equberUser = await prisma.equberUser.update({
      where: { id: req.params.id },
      data: {
        guaranteeUserId: guaranteToBe,
      },
    });
    if (!equberUser) {
      return next(
        new AppError(`There is no  equberUser with Id ${req.params.id} .`, 400)
      );
    }

    //     await SMSService.sendSms(
    //       user.phoneNumber!,
    //       `Hi ${user.fullName},
    // ${CurrentUser?.firstName} has selected you as their guarantor for their Equb. Please review and approve their request at your earliest convenience.`
    //     );

    const tokens = user?.deviceTokens.map((token) => token.token);
    console.log("tokens");
    console.log(tokens);
    // @ts-ignore

    PushNotification.getInstance().sendNotification(
      `Hi ${user.fullName}`,
      `${req.body.fullName} has received your guarantor request.`,
      tokens,
      {
        payload: "request",
      } as IPayload
    );
    await prisma.notification.create({
      data: {
        title: "Hagerigna Equb",
        body: `${req.body.fullName} has received your guarantor request.`,
        userId: `${user.id}`,
      },
    });
    res.status(200).json({
      status: "success",
      messgae: "Your Guarantor accepts you succesfully",
      data: equberUser,
    });
  }
);
export const sendGuarantorNotificaton = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.body;
    console.log("send Guarantor exist");
    let user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        deviceTokens: true,
      },
    });
    console.log(" req.params.id", req.params.id);
    console.log("selected user", user);

    if (!user) {
      return next(new AppError(`There is no  user with Id ${userId} .`, 400));
    }
    if (user.id === req.user?.id) {
      return next(
        new AppError(`You can not choose yourself as a guarantee.`, 400)
      );
    }
    // const equberUser = await prisma.equberUser.update({
    //   where: { id: req.params.id },
    //   data: {
    //     guaranteeUserId: userId,
    //   },
    // });
    // if (!equberUser) {
    //   return next(
    //     new AppError(`There is no  equberUser with Id ${req.params.id} .`, 400)
    //   );
    // }

    //     await SMSService.sendSms(
    //       user.phoneNumber!,
    //       `Hi ${user.fullName},
    // ${CurrentUser?.firstName} has selected you as their guarantor for their Equb. Please review and approve their request at your earliest convenience.`
    //     );

    const tokens = user?.deviceTokens.map((token) => token.token);
    console.log("tokens");
    console.log(tokens);
    // @ts-ignore

    PushNotification.getInstance().sendNotification(
      `Hi ${user.fullName}`,
      `${req.body.fullName} has selected you as their guarantor for their Equb. Please review and approve their request at your earliest convenience.`,
      tokens,
      {
        payload: "request",
        guaranteeId: req.body.userId?.toString() || "",
        equbId: req.params.id?.toString() || "",
        equbName: req.body.equbName?.toString() || "",
        equbAmount: req.body.equbAmount?.toString() || "",
        fullName: req.body.fullName?.toString() || "",
        guaranteeNeedyId: req.body.firstUserId?.toString() || "",
      } as IPayload
    );
    await prisma.notification.create({
      data: {
        title: "Hagerigna Equb",
        body: `${req.body.fullName} has selected you as their guarantor for their Equb. Please review and approve their request at your earliest convenience.`,
        userId: `${user.id}`,
      },
    });
    res.status(200).json({
      status: "success",
      messgae: "You sent the Guarantor succesfully",
      // data: equberUser,
    });
  }
);

export const sendDeleteNotification = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.body;
    let user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        deviceTokens: true,
      },
    });
    console.log(" req.params.id", req.params.id);
    console.log("selected user", user);

    if (!user) {
      return next(new AppError(`There is no  user with Id ${userId} .`, 400));
    }

    const tokens = user?.deviceTokens.map((token) => token.token);
    console.log("tokens");
    console.log(tokens);
    // @ts-ignore

    PushNotification.getInstance().sendNotification(
      `Hi ${user.fullName}`,
      `${req.body.fullName}has rejected your guarantor request for your Equb.`,
      tokens,
      {
        type: "test",
      } as IPayload
    );
    await prisma.notification.create({
      data: {
        title: "Hagerigna Equb",
        body: `${req.body.fullName} has removed you as their guarantor for their Equb. Please contact them if you have any questions.`,
        userId: `${user.id}`,
      },
    });
    res.status(200).json({
      status: "success",
      messgae: "The delete guarantor notification was sent successfully.",
      // data: equberUser,
    });
  }
);

export const getUnwonUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await prisma.user.findMany({
      where: {
        equberUsers: {
          some: {
            hasTakenEqub: false,
          },
        },
      },
      include: {
        equberUsers: {
          where: {
            hasTakenEqub: false,
          },
        },
      },
    });

    return res.status(200).json({
      status: "success",
      data: users,
      unwonUsersCount: users.length,
    });
  }
);

export const GetEquberUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
   

    console.log("equbId", req.params.equbId);
    console.log("userId",req.params.userId);

    // Fetch the Equber users and include the related Equber model
const equberUsers = await prisma.equberUser.findMany({
  where: {
    userId: req.params.userId,
    equber: {
      equbId: req.params.equbId,
      lotteryNumber: {
        not: '',
      },
    },
  },
  include: {
    equber: {
      select: {
        lotteryNumber: true,
      },
    },
  },
});


    if (!equberUsers || equberUsers.length === 0) {
      return next(
        new AppError(`No Equber user with Equb ID ${req.params.equbId}.`, 400)
      );
    }

    // Format the data as a list
    const data = equberUsers.map((user) => ({
      hasClaimed: true,
      stake: user.stake,
      lotteryNumber: user.equber?.lotteryNumber ?? null,
    }));

    res.status(200).json({
      status: "success",
      data,
    });
  }
);


export const claimEqub = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { selectedBankAccount } = req.body;

    // Fetch the Equber user and include their bankAccounts
    const equberUser = await prisma.equberUser.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          include: {
            bankAccounts: true,
          },
        },
      },
    });
    if (!equberUser) {
      return next(
        new AppError(`No Equber user with ID ${req.params.id}. `, 400)
      );
    }

    // Find the account in the user's bankAccounts array
    const accountExists = equberUser?.user?.bankAccounts?.some(
      (account) => account.accountNumber === selectedBankAccount
    );

    // Update the selected account to isPrimary = true

    if (accountExists) {
      await prisma.user.update({
        where: { id: equberUser.user.id },
        data: {
          bankAccounts: {
            updateMany: [
              // Set all accounts' isPrimary to false
              { where: {}, data: { isPrimary: false } },
              // Set the selected account's isPrimary to true
              {
                where: { accountNumber: selectedBankAccount },
                data: { isPrimary: true },
              },
            ],
          },
        },
      });
    }

    await prisma.equberUser.update({
      where: { id: req.params.id },
      data: {
        hasClaimed: true,
      },
    });

    res.status(200).json({
      status: "success",
      data: {
        hasClaimed: true,
      },
    });
  }
);

export const getMyEqubPayment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as unknown as GetMyEqubPaymentsQueryInterface;

    const approved = query.approved === "true" ? true : false;

    const equb = await prisma.equb.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!equb) {
      return next(
        new AppError(`Equb with ID ${req.params.id} does not exist`, 400)
      );
    }

    const payments = await prisma.payment.findMany({
      where: {
        equbId: equb.id,
        userId: req.user?.id,
        approved: approved,
      },
      include: {
        equb: {
          select: {
            name: true,
          },
        },
        equberUserPayments: {
          include: {
            equberUser: {
              select: {
                equber: {
                  select: {
                    lotteryNumber: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      status: "success",
      data: {
        payments: payments.map((payment) => ({
          id: payment.id,
          amount: payment.amount,
          equbName: payment.equb.name,
          picture: payment.picture,
          payments: payment.equberUserPayments.map((equberUserPayment) => ({
            lotteryNumber: equberUserPayment.equberUser?.equber?.lotteryNumber,
            amount: equberUserPayment.amount,
          })),
        })),
      },
    });
  }
);

export const makeEqubPayment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("got here");
    console.log(req.body);

    const { paidAmount, lottery, paymentMethod, phoneNumber, picture } =
      req.body;

    const equb = await prisma.equb.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!equb) {
      return next(
        new AppError(`Equb with ID ${req.params.id} does not exist`, 400)
      );
    }
    // const client = new SantimpaySdk(
    //   process.env.GATEWAY_MERCHAT_ID!,
    //   PRIVATE_KEY_IN_PEM!
    // );

    const successRedirectUrl = "http://dashboard.hageregnaequb.com/dashboard/home";
    const failureRedirectUrl = "http://dashboard.hageregnaequb.com/dashboard/payment";
    const cancelRedirectUrl = "http://api.hageregnaequb.com/";

    // backend utus update (webhook)
    // const notifyUrl = "http://localhosrl to receive a stat/api/v1/user/payment/notify";
    const notifyUrl =
      "https://api.hageregnaequb.com/api/v1/user/payment/notify";

    const transactionId = Math.floor(Math.random() * 1000000000).toString();

    let payment: any;
    console.log("Payment data:", {
      type: "registering",
      paymentMethod: paymentMethod,
      amount: paidAmount,
      round: equb.currentRound,
      equbId: equb.id,
      userId: req.user?.id!,
      picture: picture || null,
      state: "inactive",
      transactionId: transactionId,
    });

    if (paymentMethod === "santimpay") {
      payment = await prisma.payment.create({
        data: {
          type: "registering",
          paymentMethod: paymentMethod,
          amount: 0,
          round: equb.currentRound,
          equbId: equb.id,
          userId: req.user?.id!,
          picture: picture || null,
          state: "inactive",
          transactionId: transactionId || "",
        },
      });
      console.log("santimPay payment...", payment);

    } else {

      payment = await prisma.payment.create({
        data: {
          type: "equb",
          paymentMethod: paymentMethod,
          amount: paidAmount,
          round: equb.currentRound,
          equbId: equb.id,
          userId: req.user?.id!,
          state: "inactive",
          picture: picture || null,
          transactionId: transactionId || "",
        },
      });
      console.log("bank payment...", payment);

    }

    // const checkoutUrl = await client.generatePaymentUrl(
    //   transactionId,
    //   paidAmount,
    //   "Payment for joining Equb",
    //   successRedirectUrl,
    //   failureRedirectUrl,
    //   notifyUrl,
    //   phoneNumber,
    //   cancelRedirectUrl
    // );
    // console.log("checkoutUrl", checkoutUrl);
    console.log("lottery...", lottery);


    // let payment = await prisma.payment.create({
    //   data: {
    //     type: "equb",
    //     paymentMethod: paymentMethod,
    //     amount: paidAmount,
    //     round: equb.currentRound,
    //     equbId: equb.id,
    //     userId: req.user?.id!,
    //   },
    // });
    console.log("equber...", payment);
    for (let i = 1; i <= lottery.length; i++) {
      const equber = lottery[i - 1];

      const equberUserId = equber.id;

      const paidAmount = Number(equber.paidAmount);
      const equberUser = (await prisma.equberUser.findUnique({
        where: {
          id: equberUserId,
        },
      })) as unknown as EquberUser;
      if (equberUser) {
        const equberUserPayment = await prisma.equberUserPayment.create({
          data: {
            payment: {
              connect: {
                id: payment.id,
              },
            },
            amount: paidAmount,
            equberUser: {
              connect: {
                id: equberUser.id,
              },
            },
          },
        });
      } else {
        console.log(`Equber user with id ${equberUserId} not found.`);
      }
    }
    const equbPayment = await prisma.payment.findUnique({
      where: {
        id: payment.id,
      },
      include: { equberUserPayments: true },
    });
    res.status(200).json({
      status: "success",
      data: {
        equbPayment,
      },
    });
  }
);

export const makeLotteryRequest = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { itemName, description, amount } = req.body;

    const equber = await prisma.equber.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!equber) {
      return next(
        new AppError(`Equber with ID ${req.params.id} does not exist`, 400)
      );
    }

    const request = await prisma.lotteryRequest.create({
      data: {
        equberId: req.params.id,
        itemName: itemName,
        description: description,
        amount: Number(amount),
      },
    });
    res.status(200).json({
      status: "success",
      data: {
        request,
      },
    });
  }
);
export const updateLotteryRequest = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { itemName, description, amount } = req.body;
    const updatedData: any = {};
    if (itemName) updatedData.itemName = itemName;
    if (description) updatedData.description = description;
    if (amount) updatedData.amount = Number(amount);

    const request = await prisma.lotteryRequest.update({
      where: {
        id: req.params.id,
      },
      data: updatedData,
    });
    res.status(200).json({
      status: "success",
      data: {
        request,
      },
    });
  }
);
export const getMyLotteryRequest = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const request = await prisma.lotteryRequest.findUnique({
      where: {
        equberId: req.params.id,
      },
    });

    res.status(200).json({
      status: "success",
      data: {
        request,
      },
    });
  }
);

export const savingMember = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const equb = await prisma.equb.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        description: true,
        name: true,
        equbAmount: true,
        startDate: true,
        endDate: true,
        goal: true,
        equbers: {
          include: {
            users: {
              include: {
                user: true,
              },
            },
            payments: true,
            paymentHistories: true,
          },
        },
      },
    });
    if (!equb) {
      return next(
        new AppError(`Equb with ID ${req.params.id} does not exist`, 404)
      );
    }
    const equbers = equb.equbers.filter((equber) =>
      equber.users?.some((user) => user.user.id === req.user?.id)
    );
    const totalPaid = equbers.reduce((acc, equber) => {
      return acc + equber.totalPaid;
    }, 0);

    res.status(200).json({
      status: "success",
      data: {
        payments: {
          equb: {
            id: equb.id,
            name: equb.name,
            goal: equb.goal! * equbers.length,
            equbAmount: equb.equbAmount,
            totalPaid,
          },
          lotteries: equbers.map((equber) => {
            return {
              lotteryNumber: equber.lotteryNumber,
              equberUserId: equber.users[0].id,
              totalPaid: equber.totalPaid,
              lastPaidOn:
                equber.paymentHistories.length > 0
                  ? equber.paymentHistories[equber.paymentHistories.length - 1]
                    .createdAt
                  : null,
            };
          }),
        },
      },
    });
  }
);
