import { NextFunction, Request, Response } from "express";

import { QueryInterface } from "../../../shared/interfaces/query.interface";
import prisma from "../../../config/db.config";
import { catchAsync } from "../../../config/error.config";
import AppError from "../../../shared/errors/app.error";
import { Equb, Permissions } from "@prisma/client";
import { GetClaimQueryInterface, GetEqubsQueryInterface } from "../../../interfaces/equb.interface";
import { WebSocketService } from "../../../shared/web-socket/services/web-socket.service";
import { EventNames } from "../../../shared/web-socket/enums/event-name.enum";
import { getEligibleEqubers } from "./helper/get-eligible-equbers.helper";
import { getDateInNairobiTimezone } from "../../../shared/helpers/date.helper";
import { getEqubStatistics } from "./helper/get-equb-stat.helper";
import dayjs from "dayjs";
import MailService from "../../../shared/mail/services/mail.service";
import { PushNotification } from "../../../shared/notification/services/notification.service";
import { IPayload } from "../../../shared/notification/interfaces/payload.interface";
import {
  equbersPaid,
  PopulatedEqub,
  structuredPayment,
  structuredUserPayment,
} from "../../user/equb/helper/payment.helper";
import { GetPaymentsQueryInterface } from "../../../interfaces/payment-query.interface";
import { IFilter } from "../../../shared/interfaces/filter.interface";
import { xonokai } from "@react-email/components";

export const getAllEqubs = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as unknown as GetEqubsQueryInterface;
    // Get the start and end date from the query
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    const filter = (req as any).filter || {};

    if (query._search) {
      filter.name = {
        contains: query._search,
        mode: "insensitive",
      };
    }

    if (query.equbType) {
      filter.equbType = { name: query.equbType };
    }
    if (query.equbCategory) {
      filter.equbCategory = { name: query.equbCategory };
    }
    // Add date filtering to the where clause if startDate and endDate are provided
    if (startDate && endDate) {
      filter.createdAt = {
        gte: startDate,
        lte: endDate,

      };
    }

    // Fetch all entries without pagination for sorting
    const allEqubs = await prisma.equb.findMany({
      where: filter,
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
    // Sorting logic based on the difference from currentDate to nextRoundDate
    if (query.sortBy) {
      if (query.sortBy === "newest") {
        // Sort by the soonest nextRoundDate (ascending order)
        allEqubs.sort((a, b) => {
          const dateA = a.nextRoundDate
            ? new Date(a.nextRoundDate).getTime()
            : Infinity; // Use Infinity if null
          const dateB = b.nextRoundDate
            ? new Date(b.nextRoundDate).getTime()
            : Infinity; // Use Infinity if null
          return dateA - dateB; // Ascending order
        });
      } else if (query.sortBy === "oldest") {
        // Sort by the farthest nextRoundDate (descending order)
        allEqubs.sort((a, b) => {
          const dateA = a.nextRoundDate
            ? new Date(a.nextRoundDate).getTime()
            : -Infinity; // Use -Infinity if null
          const dateB = b.nextRoundDate
            ? new Date(b.nextRoundDate).getTime()
            : -Infinity; // Use -Infinity if null
          return dateB - dateA; // Descending order
        });
      }
    }


    // Count total entries for pagination
    const totalCount = allEqubs.length; // Total entries after filtering

    // Respond with the sorted and paginated data
    res.status(200).json({
      status: "success",
      data: {
        equbs: allEqubs,
        meta: {
          total: totalCount,
        },
      },
    });
  }
);

export const getEqubs = catchAsync(
  async (req: Request, res: Response) => {

    const [equbs, totalCount] = await Promise.all([
      prisma.equb.findMany(),
      prisma.equb.count()
    ]);

    res.status(200).json({
      status: "success",
      data: {
        equbs,
        totalCount
      },
    });
  }
);

export const getRunningEqubs = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as unknown as QueryInterface;
    const page = Number(query._page) || 1;
    const limit = Number(query._limit) || 10;
    const skip = Number((page - 1) * limit);

    const [runningEqubs, total] = await Promise.all([
      prisma.equb.findMany({
        where: { status: "started" },
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
        take: limit,
        skip,
      }),
      prisma.equb.count({ where: { status: "started" } }),
    ]);

    res.status(200).json({
      status: "success",
      data: {
        runningEqubs,
        meta: {
          page,
          limit,
          total,
        },
      },
    });
  }
);
export const getRegisteringEqubs = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as unknown as QueryInterface;
    const page = Number(query._page) || 1;
    const limit = Number(query._limit) || 10;
    const skip = Number((page - 1) * limit);

    const [registeringEqubs, total] = await Promise.all([
      prisma.equb.findMany({
        where: {
          status: "registering",
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
        take: limit,
        skip,
      }),
      prisma.equb.count({
        where: {
          status: "registering",
        },
      }),
    ]);

    res.status(200).json({
      status: "success",
      data: {
        registeringEqubs,
        meta: {
          page,
          limit,
          total,
        },
      },
    });
  }
);
export const getClosedEqubs = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as unknown as QueryInterface;
    const page = Number(query._page) || 1;
    const limit = Number(query._limit) || 10;
    const skip = Number((page - 1) * limit);

    const [closedEqubs, total] = await Promise.all([
      prisma.equb.findMany({
        where: { status: "completed" },
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
        take: limit,
        skip,
      }),
      prisma.equb.count({ where: { status: "completed" } }),
    ]);

    res.status(200).json({
      status: "success",
      data: {
        closedEqubs,
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
        equbers: {
          include: {
            users: {
              include: {
                user: true,
              },
            },
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
export const getEqubMembers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as unknown as GetEqubsQueryInterface;
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    const page = Number(query._page) || 1;
    const limit = Number(query._limit) || 10;
    const skip = Number((page - 1) * limit);

    const equb = await prisma.equb.findUnique({ where: { id: req.params.id } });
    if (!equb) {
      return next(
        new AppError(`Equb with ID ${req.params.id} does not exist`, 400)
      );
    }

    const filter: any = {
      equbId: req.params.id,
    };

    if (query._search) {
      filter.users = {
        some: {
          user: {
            fullName: {
              contains: query._search,
              mode: "insensitive",
            },
          },
        },
      };
    }
    // Add date filtering to the where clause if startDate and endDate are provided
    if (startDate && endDate) {
      filter.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    }
    // Add date filtering to the where clause if LOTTERY_NUMBER
    if (query.lotteryNumber) {
      filter.lotteryNumber = {
        equals: query.lotteryNumber,
      };
    }


    const orderBy =
      query.sortBy === "oldest"
        ? { createdAt: "asc" as const }
        : { createdAt: "desc" as const };

    const [equbers, total] = await Promise.all([
      prisma.equber.findMany({
        where: filter,
        take: limit,
        skip,
        include: {
          users: {
            include: { user: true },
          },
        },
        orderBy,
      }),
      prisma.equber.count({
        where: filter,
      }),
    ]);

    res.status(200).json({
      status: "success",
      data: {
        members: equbers,
        meta: {
          page,
          limit,
          total,
        },
      },
    });
  }
);
export const getExportEqubMembers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as unknown as GetEqubsQueryInterface;
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    const equb = await prisma.equb.findUnique({ where: { id: req.params.id } });
    if (!equb) {
      return next(
        new AppError(`Equb with ID ${req.params.id} does not exist`, 400)
      );
    }

    const filter: any = {
      equbId: req.params.id,
    };

    if (query._search) {
      filter.users = {
        some: {
          user: {
            fullName: {
              contains: query._search,
              mode: "insensitive",
            },
          },
        },
      };
    }
    // Add date filtering to the where clause if startDate and endDate are provided
    if (startDate && endDate) {
      filter.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    }
    // Add date filtering to the where clause if LOTTERY_NUMBER
    if (query.lotteryNumber) {
      filter.lotteryNumber = {
        equals: query.lotteryNumber,
      };
    }


    const orderBy =
      query.sortBy === "oldest"
        ? { createdAt: "asc" as const }
        : { createdAt: "desc" as const };

    const [equbers, total] = await Promise.all([
      prisma.equber.findMany({
        where: filter,
        include: {
          users: {
            include: { user: true },
          },
        },
        orderBy,
      }),
      prisma.equber.count({
        where: filter,
      }),
    ]);

    res.status(200).json({
      status: "success",
      data: {
        members: equbers,
        meta: {
          total,
        },
      },
    });
  }
);

export const getEqubStat = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as unknown as QueryInterface;
    const page = Number(query._page) || 1;
    const limit = Number(query._limit) || 10;
    const skip = Number((page - 1) * limit);
    const equb = await prisma.equb.findUnique({ where: { id: req.params.id } });
    if (!equb) {
      return next(
        new AppError(`Equb with ID ${req.params.id} does not exist`, 400)
      );
    }

    const stat = await getEqubStatistics(equb);
    res.status(200).json({
      status: "success",
      data: {
        stat,
      },
    });
  }
);

export const getEqubMember = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Step 1: Fetch equber with only the required fields to calculate totalEligibilityPoint
    const equberPoints = await prisma.equber.findUnique({
      where: {
        id: req.params.id,
      },
      select: {
        id: true,
        financePoint: true,
        kycPoint: true,
        adminPoint: true,
      },
    });

    if (!equberPoints) {
      return next(
        new AppError(`Equber with ID ${req.params.id} does not exist`, 400)
      );
    }

    // Calculate total eligibility based on the individual points
    const totalEligibilityPoint =
      Number(equberPoints.adminPoint) +
      Number(equberPoints.financePoint) +
      Number(equberPoints.kycPoint);

    // Step 2: Update the equber with the calculated totalEligibilityPoint
    const updatedEquber = await prisma.equber.update({
      where: {
        id: req.params.id,
      },
      data: {
        totalEligibilityPoint, // Update with calculated total eligibility
      },
      include: {
        users: {
          include: {
            user: {
              include: {
                equberUsers: {
                  select: { id: true },
                },
                bankAccounts: true,
              },
            },
            guarantee: true,
            guaranteeUser: true,
          },
        },
      },
    });

    res.status(200).json({
      status: "success",
      data: {
        member: updatedEquber,
      },
    });
  }
);

export const updateEqubMemberEligibility = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { adminPoint, excluded, included, show } = req.body;
    // const equbers = await prisma.equber.findUnique({
    //   where: {
    //     id: req.params.id,
    //   },
    //   include: {
    //     users: true,
    //   },
    // });

    // const takenEqub = equbers?.users[0].hasTakenEqub
    let equber = await prisma.equber.findUnique({
      where: {
        id: req.params.id,
      },
    });
    if (!equber) {
      return next(
        new AppError(`Equber with ID ${req.params.id} does not exist`, 400)
      );
    }
    const { financePoint, kycPoint } = equber;
    equber = await prisma.equber.update({
      where: {
        id: req.params.id,
      },
      data: {
        adminPoint: Number(adminPoint),
        totalEligibilityPoint: Number(
          Number(adminPoint) + Number(financePoint) + Number(kycPoint)
        ),
        excluded: excluded,
        included: included,
        show: show,
      },
      include: {
        users: {
          include: {
            user: true,
          },
        },
      },
    });

    res.status(200).json({
      status: "success",
      data: {
        member: equber,
      },
    });
  }
);
export const createEqub = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      name,
      description,
      equbTypeId,
      equbCategoryId,
      numberOfEqubers,
      branchId,
      startDate,
      equbAmount,
      groupLimit,
      serviceCharge,
      goal,
      other,
      endDate,
    } = req.body;

    const equbType = await prisma.equbType.findUnique({
      where: { id: equbTypeId },
    });

    if (!equbType) {
      return next(
        new AppError(`Equb type with ID ${equbTypeId} does not exist`, 400)
      );
    }
    const equbCategory = await prisma.equbCategory.findUnique({
      where: { id: equbCategoryId },
    });

    if (!equbCategory) {
      return next(
        new AppError(
          `Equb category with ID ${equbCategoryId} does not exist`,
          400
        )
      );
    }
    if (branchId) {
      const branch = await prisma.branch.findUnique({
        where: { id: branchId },
      });
      if (!branch) {
        return next(
          new AppError(`Branch with ID ${req.params.id} does not exist`, 400)
        );
      }
    }
    const mainBranch = await prisma.branch.findFirst({
      where: { isMain: true },
    });

    // Set nextRoundDate to null if the equbCategory is Car, House, or Travel
    const nextRoundDate = ["Car", "House", "Travel"].includes(equbCategory.name)
      ? null
      : endDate
        ? new Date(endDate)
        : new Date(startDate);

    const equb = await prisma.equb.create({
      data: {
        name: name,
        description: description ? description : "",
        equbTypeId: equbTypeId,
        equbCategoryId: equbCategoryId,
        numberOfEqubers: Number(numberOfEqubers),
        equbAmount: Number(equbAmount),
        staffId: req.staff?.id,
        branchId: branchId ? branchId : mainBranch?.id,
        startDate: new Date(startDate),
        nextRoundDate: nextRoundDate,
        groupLimit: Number(groupLimit),
        serviceCharge: Number(serviceCharge),
        goal: goal ? parseFloat(goal) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        other: other ? other : "",
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
    await prisma.activity.create({
      data: {
        action: Permissions.equb,
        staffId: req.staff?.id!,
        equbId: equb.id,
        description: `${req.staff?.fullName} created a new equb - ${equb.name}.`,
      },
    });
    res.status(200).json({
      status: "success",
      data: {
        equb,
      },
    });
  }
);

export const updateEqub = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      name,
      description,
      numberOfEqubers,
      startDate,
      equbAmount,
      groupLimit,
      serviceCharge,
      endDate,
      goal,
      other,
    } = req.body;
    const updatedData: any = {
      name,
    };
    if (description) updatedData.description = description;
    if (startDate) {
      updatedData.startDate = new Date(startDate);
      // updatedData.nextRoundDate = new Date(startDate);
    }
    if (endDate) updatedData.endDate = new Date(endDate);
    if (goal) updatedData.goal = parseFloat(goal);
    if (numberOfEqubers) updatedData.numberOfEqubers = Number(numberOfEqubers);
    if (equbAmount) updatedData.equbAmount = Number(equbAmount);
    if (groupLimit) updatedData.groupLimit = Number(groupLimit);
    if (serviceCharge) updatedData.serviceCharge = Number(serviceCharge);
    if (other) updatedData.other = other;

    const equb = await prisma.equb.update({
      where: { id: req.params.id },
      data: updatedData,
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
        new AppError(`Equb type with ID ${req.params.id} does not exist`, 400)
      );
    }
    await prisma.activity.create({
      data: {
        action: Permissions.equb,
        staffId: req.staff?.id!,
        description: `${req.staff?.fullName} updated an equb`,
        equbId: equb.id,
      },
    });
    res.status(200).json({
      status: "success",
      data: {
        equb,
      },
    });
  }
);

export const setLottery = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      nextRoundDate,
      nextRoundTime,
      currentRoundWinners,
      nextRoundLotteryType,
      notifyAllMembers,
    } = req.body;

    let equb = await prisma.equb.findUnique({
      where: { id: req.params.id },
      include: {
        equbers: {
          select: { id: true, hasWonEqub: true },
        },
      },
    });
    if (!equb) {
      return next(
        new AppError(`Equb with ID ${req.params.id} does not exist`, 400)
      );
    }

    // const equbersWhoHaveNotWon = equb.equbers.filter(equber=>equber.hasWonEqub === false );
    // if(currentRoundWinners>equbersWhoHaveNotWon){
    //   return next(
    //     new AppError(`Number of winners could not exceed number of remaining equbers.`, 400)
    //   );
    // }
    const combinedDateTimeString = `${nextRoundDate}T${nextRoundTime}:00`;
    console.log("Combined Date-Time String:");
    console.log(combinedDateTimeString);

    const date = new Date(combinedDateTimeString);
    console.log("Parsed Date:");
    console.log(date);

    if (isNaN(date.getTime())) {
      return next(new AppError(`Invalid combined date and time`, 400));
    }
    equb = await prisma.equb.update({
      where: {
        id: req.params.id,
      },
      data: {
        nextRoundDate: date,
        nextRoundTime: nextRoundTime,
        currentRoundWinners: Number(currentRoundWinners),
        nextRoundLotteryType: nextRoundLotteryType,
      },
      include: {
        equbers: {
          include: {
            users: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    const now = new Date();
    // const aMinuteAgo = new Date(now.getTime() - 60 * 1000);
    const aMinuteAgoInEth = getDateInNairobiTimezone(now);
    console.log(`aMinuteAgoInEth`, aMinuteAgoInEth);
    console.log(`equb.nextRoundDate`, equb.nextRoundDate);
    const time1 = dayjs(now); // 2:30 PM
    const time2 = dayjs(equb.nextRoundDate); // 9:15 AM

    // Difference in hours
    const differenceInHours = time2.diff(time1, "hour");
    console.log(`Difference in hours: ${differenceInHours}`);

    // Difference in minutes
    const differenceInMinutes = time2.diff(time1, "minute");
    console.log(`Difference in minutes: ${differenceInMinutes}`);
    if (differenceInMinutes <= 1) {
      return next(
        new AppError(
          `You can't set lottery date a minute before Lottery Draw date.`,
          400
        )
      );
    }

    if (notifyAllMembers) {
      try {
        // Fetch Equb details with associated members
        const equbNotified = await prisma.equb.findUnique({
          where: {
            id: req.params.id,
          },
          include: {
            equbers: {
              include: {
                users: {
                  include: {
                    user: {
                      include: {
                        deviceTokens: true,
                      },
                    },
                  },
                },
              },
            },
            equbType: true,
            equbCategory: true,
          },
        });

        if (!equbNotified) {
          console.error("Equb not found.");
          return;
        }

        // Validate and construct next round date and time
        if (!nextRoundDate || !nextRoundTime) {
          console.error("Missing nextRoundDate or nextRoundTime.");
          return;
        }

        // const nextRoundDateTime = new Date(
        //   `${nextRoundDate}T${nextRoundTime}:00`
        // );

        // Skip notifications if the target time is in the past
        if (differenceInMinutes <= 0) {
          console.log(
            "The next round date and time is in the past. No notification sent."
          );
          return;
        }

        // Extract device tokens and member details
        const members = equbNotified.equbers.flatMap((equber) =>
          equber.users.map((user) => ({
            token: user.user.deviceTokens?.map((token) => token.token),
            fullName: user.user.fullName,
            id: user.user.id,
          }))
        );

        // Destructure Equb details for notifications
        const {
          name: equbName,
          id: equbId,
          serviceCharge: equbServiceCharge,
          equbAmount,
          numberOfEqubers,
          equbCategory,
        } = equbNotified;

        const equbRequest = equbCategory.needsRequest;
        const equberLength = equbNotified.equbers.length;

        // Send notifications if within 10 minutes
        // if (differenceInMinute <= 10) {
        const message = `The ${equbName} Equb draw is drawn in ${nextRoundDate} at ${nextRoundTime}. Please be prepared!`;

        console.log("nextRoundDate", nextRoundDate);

        const sendNextRound = new Date(equbNotified?.nextRoundDate!);
        const isoString = date.toISOString();
        console.log("equbNotified?.nextRoundDate!", isoString);

        await Promise.all(
          members.map(async (member) => {
            try {
              if (member.token && member.token.length > 0) {
                // Send push notification
                await PushNotification.getInstance().sendNotification(
                  `Hello ${member.fullName}`,
                  message,
                  member.token,
                  {
                    type: "Equb Draw",
                    equbName: equbName.toString(),
                    equbId: equbId.toString(),
                    equbServiceCharge: equbServiceCharge.toString(),
                    equbAmount: equbAmount.toString(),
                    nextRoundTime: nextRoundTime.toString(),
                    nextRoundDate: isoString,
                    nextRoundLotteryType: nextRoundLotteryType.toString(),
                    numberOfEqubers: numberOfEqubers.toString(),
                    equbRequest: equbRequest.toString(),
                    equberLength: equberLength.toString(),
                  } as unknown as IPayload
                );

                // Save notification to the database
                await prisma.notification.create({
                  data: {
                    title: "Hagerigna Equb",
                    body: message,
                    userId: `${member.id}`,
                  },
                });
              }
            } catch (error) {
              console.error(
                `Failed to send notification to ${member.fullName}:`,
                error
              );
            }
          })
        );

        console.log(
          `Equb draw notifications sent to: ${members
            .map((member) => member.fullName)
            .join(", ")}`
        );
        // }
      } catch (error) {
        console.error("Error in processing notifications:", error);
      }
    }

    // Define the two dates as ISO strings
    const equbNextRoundDate = new Date(equb.nextRoundDate!);
    const currentDateInNairobi = new Date(getDateInNairobiTimezone(new Date()));

    // Ensure the dates are properly typed and converted to numbers (milliseconds since epoch)
    const differenceInMilliseconds =
      equbNextRoundDate.getTime() - currentDateInNairobi.getTime();

    // Convert the difference to seconds
    const differenceInSeconds = Math.floor(differenceInMilliseconds / 1000);

    // Calculate days, hours, minutes, and seconds
    const days = Math.floor(differenceInSeconds / (3600 * 24));
    const hours = Math.floor((differenceInSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((differenceInSeconds % 3600) / 60);
    const seconds = differenceInSeconds % 60;

    // Log the human-readable difference
    console.log(
      `Time difference: ${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`
    );

    // Add the difference to a reference date (e.g., Epoch or a specific date)
    const referenceDate = new Date("1970-01-01T00:00:00.000Z"); // Base date (can be adjusted)
    const newDate = new Date(
      referenceDate.getTime() + differenceInMilliseconds
    );

    // Format the result as an ISO string
    const formattedDifferenceDate = newDate.toISOString();

    // Log the ISO-like formatted difference date
    console.log(`Difference as ISO-like date: ${formattedDifferenceDate}`);

    // Log the result
    // console.log(`Time difference: ${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`);

    WebSocketService.getInstance().publish(EventNames.EQUB_LOTTERY, {
      nextRoundDate: equb.nextRoundDate,
      date: getDateInNairobiTimezone(new Date()),
      equbId: equb.id,
      RemainingDate: formattedDifferenceDate,
      remainingDays: days,
      remainingHours: hours,
      remainingMinutes: minutes,
      remainingSeconds: seconds,
    });
    res.status(200).json({
      status: "success",
      data: {
        equb,
      },
    });
  }
);

export const getLottery = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const equb = await prisma.equb.findUnique({
      where: {
        id: req.params.id,
      },
      include: {
        equbers: {
          include: {
            users: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!equb) {
      return next(
        new AppError(`Equb with ID ${req.params.id} does not exist`, 400)
      );
    }
    const eligibleEqubers = getEligibleEqubers(
      equb.equbers,
      equb.currentRound,
      equb.equbAmount
    );
    res.status(200).json({
      status: "success",
      data: {
        equb,
      },
    });
  }
);
export const markEqubberAsPaid = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { reference } = req.body;
    let equberUser = await prisma.equberUser.findUnique({
      where: {
        id: req.params.id,
      },
      include: {
        equber: true,
        user: {
          include: {
            deviceTokens: true,
          },
        },
      },
    });
    if (!equberUser) {
      return next(new AppError(`This equber user does not exist`, 400));
    }
  console.log("mark as paid userid", equberUser);
    const equb = (await prisma.equb.findUnique({
      where: { id: equberUser?.equber?.equbId! ?? "" },
    })) as unknown as Equb;

    const totalContribution = equb.equbAmount * equb.numberOfEqubers;
    const totalServiceCharge = totalContribution * (equb.serviceCharge / 100);

    let calculatedAmount;
    if (equberUser?.equber?.isGruop) {
      // For grouped equbers, calculate based on user's stake
      const userStake = equberUser.stake || 100;
      const userStakePercentage = userStake / 100;
      const userShare = totalContribution * userStakePercentage;
      const userServiceCharge = totalServiceCharge * userStakePercentage;
      calculatedAmount = userShare - userServiceCharge;
    } else {
      // For individual users
      calculatedAmount = totalContribution - totalServiceCharge;
    }

    equberUser = (await prisma.equberUser.update({
      where: { id: equberUser.id },
      include: { equber: true },
      data: {
        hasTakenEqub: true,
        calculatedPaidAmount: calculatedAmount,
      },
    })) as any;
  
    console.log("calculatedAmount", calculatedAmount);
    console.log("equb.numberOfEqubers", equb.numberOfEqubers);
    console.log("equberUser.stake ", equberUser?.stake ?? 100);
    console.log("equb.serviceCharge", equb.serviceCharge);
    console.log("equb.equbAmount", equb.equbAmount);

    const payment = await prisma.payment.create({
      data: {
        type: "lottery",
        equberUserId: equberUser?.id ?? "",
        amount: calculatedAmount,
        equbId: equb.id,
        paymentMethod: "bankTransfer",
        round: equberUser?.equber?.winRound! ?? "",
        userId: equberUser?.userId ?? "",
        reference: reference,
        approved: true,
      },
    });

    // Send push notification
    const message = `Your payment of ${calculatedAmount} has been marked as paid.`;
    const tokens = equberUser?.user.deviceTokens?.map((token) => token.token);

    if (tokens && tokens.length > 0) {
      await PushNotification.getInstance().sendNotification(
        `Hello ${equberUser?.user.fullName}`,
        message,
        tokens,
        {
          type: "Payment",
          amount: calculatedAmount.toString(),
          reference: reference,
        } as unknown as IPayload
      );

      // Save notification to the database
      await prisma.notification.create({
        data: {
          title: "Payment Confirmation",
          body: message,
          userId: `${equberUser?.userId}`,
        },
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        hasTakenEqub: true,
        payment,
      },
    });
  }
);

export const getLotteryRequests = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as unknown as QueryInterface;
    const page = Number(query._page) || 1;
    const limit = Number(query._limit) || 10;
    const skip = Number((page - 1) * limit);
    const equb = await prisma.equb.findUnique({ where: { id: req.params.id } });
    if (!equb) {
      return next(
        new AppError(`Equb with ID ${req.params.id} does not exist`, 400)
      );
    }

    const filter: any = {
      equber: {
        equbId: req.params.id,
      },
    };
    if (query._search) {
      filter.equber = {
        ...filter.equber,
        users: {
          some: {
            user: {
              fullName: {
                contains: query._search,
                mode: "insensitive",
              },
            },
          },
        },
      };
    }
    const orderBy =
      query.sortBy === "oldest"
        ? { createdAt: "asc" as const }
        : { createdAt: "desc" as const };
    const [requests, total] = await Promise.all([
      await prisma.lotteryRequest.findMany({
        where: filter,
        take: limit,
        skip,
        include: {
          equber: {
            include: {
              users: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
        orderBy,
      }),
      await prisma.lotteryRequest.count({
        where: filter,
      }),
    ]);
    res.status(200).json({
      status: "success",
      data: {
        requests,
        meta: {
          page,
          limit,
          total,
        },
      },
    });
  }
);

export const getEqubStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const equbs = await prisma.equb.findMany();
    const users = await prisma.user.findMany();
    console.log("Equbs Stats", equbs);

    if (!equbs) {
      return next(new AppError(`Equb  does not exist`, 400));
    }
    if (!users) {
      return next(new AppError(`Users  does not exist`, 400));
    }
    let registeringCount = 0;
    let activeCount = 0;
    let closedCount = 0;
    let totalEqubers = users.length;

    // Count the number of equbs based on their status
    equbs.forEach((equb) => {
      if (equb.status === "registering") {
        registeringCount++;
      } else if (equb.status === "started") {
        activeCount++; // 'started' becomes 'active'
      } else if (equb.status === "completed") {
        closedCount++;
      }
    });

    // Calculate the total number of equbs
    const totalEqubs = registeringCount + activeCount + closedCount;

    // Calculate percentages
    const registeringPercentage = (registeringCount / totalEqubs) * 100;
    const activePercentage = (activeCount / totalEqubs) * 100;
    const closedPercentage = (closedCount / totalEqubs) * 100;

    // Send response with counts and percentages
    res.status(200).json({
      totalEqubers,
      totalEqubs,
      registeringCount,
      activeCount,
      closedCount,
      percentages: {
        registering: Number(registeringPercentage.toFixed(0)),
        active: Number(activePercentage.toFixed(0)),
        closed: Number(closedPercentage.toFixed(0)),
      },
    });
  }
);

export const getEqubWinners = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as unknown as GetEqubsQueryInterface;
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;
    const page = Number(query._page) || 1;
    const limit = Number(query._limit) || 10;
    const skip = (page - 1) * limit;

    // Find the Equb
    const equb = await prisma.equb.findUnique({
      where: { id: req.params.id },
    });

    if (!equb) {
      return next(
        new AppError(`Equb with ID ${req.params.id} does not exist`, 400)
      );
    }
    const filter: any = {
      equbId: req.params.id,
    };

    if (query._search) {
      filter.users = {
        some: {
          user: {
            fullName: {
              contains: query._search,
              mode: "insensitive",
            },
          },
        },
      };
    }
    // Add date filtering to the where clause if startDate and endDate are provided
    if (startDate && endDate) {
      filter.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    }
    // Add date filtering to the where clause if LOTTERY_NUMBER
    if (query.lotteryNumber) {
      filter.lotteryNumber = {
        equals: query.lotteryNumber,
      };
    }

    const orderBy =
      query.sortBy === "oldest"
        ? { createdAt: "asc" as const }
        : { createdAt: "desc" as const };

    // Fetch equbers and count
    const [equbers, total] = await Promise.all([
      prisma.equber.findMany({
        where: filter,
        take: limit,
        skip,
        include: {
          users: {
            include: {
              user: true,
              payments: true,
            },
          },
        },
        orderBy,
      }),
      prisma.equber.count({
        where: filter,
      }),
    ]);

    // Calculate the paid amount for each winner
    const winnersData = await Promise.all(
      equbers.map(async (equber) => {
        const totalContribution = equb.equbAmount * equb.numberOfEqubers;
        const totalServiceCharge =
          totalContribution * (equb.serviceCharge / 100);

        if (equber.isGruop && equber.users) {
          // For grouped equbers, calculate amount for each user based on their stake
          const usersWithCalculatedAmount = await Promise.all(
            equber.users.map(async (user) => {
              const userStake = user.stake || 100;
              const userStakePercentage = userStake / 100;
              const userShare = totalContribution * userStakePercentage;
              const userServiceCharge =
                totalServiceCharge * userStakePercentage;
              const userCalculatedAmount = userShare - userServiceCharge;

              // Update calculatedPaidAmount in the database
              await prisma.equberUser.update({
                where: { id: user.id },
                data: { calculatedPaidAmount: userCalculatedAmount },
              });

              return {
                ...user,
                calculatedPaidAmount: userCalculatedAmount,
              };
            })
          );

          const calculatedPaidAmount = usersWithCalculatedAmount.reduce(
            (total, user) => total + user.calculatedPaidAmount,
            0
          );

          return {
            ...equber,
            users: usersWithCalculatedAmount,
            calculatedPaidAmount,
            isGrouped: true,
            totalStake: usersWithCalculatedAmount.reduce(
              (total, user) => total + (user.stake || 0),
              0
            ),
          };
        } else {
          // For individual users
          const calculatedPaidAmount = totalContribution - totalServiceCharge;

          const userWithCalculatedAmount = equber.users?.[0]
            ? {
              ...equber.users[0],
              calculatedPaidAmount,
            }
            : null;

          // Update calculatedPaidAmount in the database
          if (userWithCalculatedAmount) {
            await prisma.equberUser.update({
              where: { id: userWithCalculatedAmount.id },
              data: { calculatedPaidAmount },
            });
          }

          return {
            ...equber,
            users: userWithCalculatedAmount ? [userWithCalculatedAmount] : [],
            calculatedPaidAmount,
            isGrouped: false,
            totalStake: userWithCalculatedAmount?.stake || 0,
          };
        }
      })
    );

    // Response
    res.status(200).json({
      status: "success",
      data: {
        Winners: winnersData,
        meta: {
          page,
          limit,
          total,
        },
      },
    });
  }
);

export const ChartData = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const equberHistory = await prisma.equberPaymentHistory.findMany({
      where: {
        equberId: req.params.id,
      },
    });

    res.status(200).json(equberHistory);
  }
);
export const getNotifications = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const getNotifications = await prisma.notification.findMany();

    res.status(200).json(getNotifications);
  }
);
export const deleteNotifications = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const deletedNotification = await prisma.notification.delete({
      where: { id: req.params.id },
    });

    res.status(200).json({
      status: "success",
      message: "Notification deleted successfully",
      data: deletedNotification,
    });
  }
);
export const getFinanceAndOther = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await prisma.user.findMany({
      include: {
        joinedEqubs: {
          include: {
            equbCategory: true,
          },
        },
      },
    });
    console.log("users", users[0].joinedEqubs);

    const financeAndCar = users.filter(
      (user) =>
        user.joinedEqubs.some((equb) => equb.equbCategory.name === "Finance") &&
        user.joinedEqubs.some((equb) => equb.equbCategory.name === "Car")
    );

    const financeAndHouse = users.filter(
      (user) =>
        user.joinedEqubs.some((equb) => equb.equbCategory.name === "Finance") &&
        user.joinedEqubs.some((equb) => equb.equbCategory.name === "House")
    );

    const financeAndTravel = users.filter(
      (user) =>
        user.joinedEqubs.some((equb) => equb.equbCategory.name === "Finance") &&
        user.joinedEqubs.some((equb) => equb.equbCategory.name === "Travel")
    );
    const specialFinance = users.filter((user) =>
      user.joinedEqubs.some(
        (equb) => equb.equbCategory.name === "Special Finance"
      )
    );

    res.status(200).json({
      financeAndCar,
      financeAndHouse,
      financeAndTravel,
      specialFinance,
    });
  }
);

export const getFinanceAndOtherMobile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { equbTypeId, equbCategoryId } = req.query;

    const users = await prisma.user.findMany({
      where: {
        id: req.params.id,
      },
      include: {
        joinedEqubs: {
          include: {
            equbCategory: true,
            equbType: true,
            equbers: true,
          },
        },
      },
    });

    if (!users || users.length === 0) {
      return next(new AppError(`No user found with ID ${req.params.id}`, 404));
    }

    if (!users[0].joinedEqubs) {
      return next(
        new AppError(`User with ID ${req.params.id} has no joined equbs`, 404)
      );
    }

    const groupByCategory = (categoryName1: string, categoryName2?: string) => {
      return users.filter((user) => {
        const hasCategory1 = user.joinedEqubs.some((equb) => {
          // console.log(`equb.equbCategory.name: ${equb.equbCategory.name}`);
          return equb.equbCategory.name === categoryName1;
        });
        const hasCategory2 = categoryName2
          ? user.joinedEqubs.some((equb) => {
            // console.log(`equb.equbCategory.name: ${equb.equbCategory.name}`);
            return equb.equbCategory.name === categoryName2;
          })
          : true;
        // console.log(
        //   `User ${user.id} hasCategory1: ${hasCategory1}, hasCategory2: ${hasCategory2}`
        // );
        return hasCategory1 && hasCategory2;
      });
    };

    const filterEqubs = (users: any) => {
      return users
        .map((user: any) => {
          const filteredEqubs = user.joinedEqubs.filter((equb: any) => {
            const categoryMatch = equbCategoryId
              ? equb.equbCategory.id === equbCategoryId
              : true;
            const typeMatch = equbTypeId
              ? equb.equbType.id === equbTypeId
              : true;
            return categoryMatch && typeMatch;
          });

          // Only return users with at least one matching joinedEqub
          return { ...user, joinedEqubs: filteredEqubs };
        })
        .filter((user: any) => user.joinedEqubs.length > 0);
    };
    const addEquberCount = (users: any) => {
      return users.map((user: any) => {
        const joinedEqubsWithCount = user.joinedEqubs.map((equb: any) => {
          return {
            ...equb,
            equberCount: equb.equbers.length,
            equbers: undefined,
          };
        });
        return { ...user, joinedEqubs: joinedEqubsWithCount };
      });
    };

    const financeAndCar = addEquberCount(
      filterEqubs(groupByCategory("Finance", "Car"))
    );
    const financeAndHouse = addEquberCount(
      filterEqubs(groupByCategory("Finance", "House"))
    );
    const financeAndTravel = addEquberCount(
      filterEqubs(groupByCategory("Finance", "Travel"))
    );
    const specialFinance = addEquberCount(
      filterEqubs(groupByCategory("Special Finance"))
    );

    // console.log("financeAndCar", financeAndCar.length);
    // console.log("financeAndHouse", financeAndHouse.length);
    // console.log("financeAndTravel", financeAndTravel.length);
    // console.log("specialFinance", specialFinance.length);

    res.status(200).json({
      status: "success",
      data: {
        financeAndCar,
        financeAndHouse,
        financeAndTravel,
        specialFinance,
      },
    });
  }
);

export const closeEqub = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const equb = await prisma.equb.update({
      where: {
        id: req.params.id,
      },
      data: {
        status: "completed",
      },
    });

    res.status(200).json({
      status: "success",
      data: {
        equb,
      },
    });
  }
);
export const deleteEqub = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const equbId = req.params.id;

    // Delete related records in the Payment table
    await prisma.payment.deleteMany({
      where: {
        equbId: equbId,
      },
    });

    // Delete related records in the Payment table
    await prisma.payment.deleteMany({
      where: {
        equbId: equbId,
      },
    });

    // Delete the Equb record
    const equb = await prisma.equb.delete({
      where: {
        id: equbId,
      },
    });

    res.status(200).json({
      status: "success",
      // data: {
      //   equb,
      // },
    });
  }
);

export const userPayment = catchAsync(
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
            payments: {
              include: { user: true },
            },
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
    console.log("reached here");
    console.log("payments", equb);
    const allPayments = equb.equbers.flatMap((equber) => equber.payments);

    // return res.json({equbers:equb.equbers})
    res.status(200).json({
      status: "success",
      data: {
        equbRound: equb.currentRound,
        equbersPaid: equbersPaid(equb),
        equbers: equb.equbers.length,
        payments: structuredUserPayment(equb),
      },
    });
  }
);

export const getEqubClaimer = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as unknown as GetClaimQueryInterface;
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;
    const filter: any = {
      hasClaimed: true,
      hasTakenEqub: false,
    };
    if (query._search) {
      filter.user = {
        fullName: {
          contains: query._search,
          mode: "insensitive",
        },
      };
    }
    if (query.equb) {
      filter.equber = {
        equbId: query.equb,
      };
    }
    if (startDate && endDate) {
      filter.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    }

    const equbers = await prisma.equberUser.findMany({
      where: filter,
      include: {
        equber: {
          select: {
            equb: {
              select: {
                id: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });



    if (!equbers) {
      return next(new AppError(`No equbers found with hasClaimed true `, 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        equbers,
      },
    });
  }
);
export const getPaymentHistory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as unknown as GetPaymentsQueryInterface;
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    let filter: any = {};

    // Search by user full name (nested under equberUser.user)
    if (query._search) {
      const terms = query._search.split(" ").filter(Boolean); // Split by space and remove empty strings

      filter.equberUser = {
        user: {
          AND: terms.map(term => ({
            fullName: {
              contains: term,
              mode: "insensitive",
            },
          })),
        },
      };
    }


    // Filter by createdAt (directly on equberUserPayment)
    if (startDate && endDate) {
      filter.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    }

    // Filter by equbId (nested under payment.equb)
    if (query.equb) {
      filter.payment = {
        equb: {
          id: query.equb,
        },
      };
    }


    const paymentHistory = await prisma.equberUserPayment.findMany({
      where: {
        ...filter,
        equberUser: {
          ...filter?.equberUser,
          equber: {
            isNot: null,
          },
        },
      },
      select: {
        id: true,
        amount: true,
        payment: {
          select: {
            type: true,
            paymentMethod: true,
            equb: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        equberUser: {
          select: {
            id: true,
            paymentScoreCalculatedRound: true,
            equber: {
              select: {
                lotteryNumber: true,
              },
            },
            stake: true,
            calculatedPaidAmount: true,
            user: {
              select: {
                fullName: true,
                phoneNumber: true,
              },
            },
          },
        },
        createdAt: true,
      },
    });

//       // Fetching payments where type is "lottery"
// paymentHistory.forEach(element => {
//   if(element.equberUser?.calculatedPaidAmount) {
//     const payment=  prisma.equberUser.findFirst({
//       where: {
//         id: element.equberUser.id,
//       },
//   })
//    }
// });
    
    // Calculate total amounts for both payments
    const totalPaid = paymentHistory.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    const totalReceived = paymentHistory
      .reduce((sum, payment) => sum + (payment.equberUser?.calculatedPaidAmount || 0), 0);



    //  Log full nested structure
    console.dir(paymentHistory, { depth: null });

 
    // Respond with the data
    res.status(200).json({
      status: "success",
      data: {
        paymentHistory,
        totalPaid,
        totalReceived,
      },
    });
  }
);

