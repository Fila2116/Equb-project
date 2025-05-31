import { NextFunction, Request, Response } from "express";

import { QueryInterface } from "../../../shared/interfaces/query.interface";
import prisma from "../../../config/db.config";
import { catchAsync } from "../../../config/error.config";
import AppError from "../../../shared/errors/app.error";
import { Permissions } from "@prisma/client";
import { addKycPoint } from "../../../utils/kycPoint";

export const getUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as unknown as QueryInterface;
    const page = Number(query._page) || 1;
    const limit = Number(query._limit) || 10;
    const skip = Number((page - 1) * limit);
    // Get the start and end date from the query
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    const search = query._search ? query._search.toString() : "";

    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        {
          firstName: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          fullName: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    // Add date filtering to the where clause if startDate and endDate are provided
    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    }
    // console.log("startDate", startDate);
    // console.log("endDate", endDate);
    // console.log("whereClause", whereClause);
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        include: { joinedEqubs: true },
        take: limit,
        skip,
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    res.status(200).json({
      status: "success",
      data: {
        users,
        meta: {
          page,
          limit,
          total,
        },
      },
    });
  }
);

export const getUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await prisma.user.findUnique({
      where: {
        id: req.params.id,
      },
      include: { joinedEqubs: true },
    });

    if (!user) {
      return next(
        new AppError(`User with ID ${req.params.id} does not exist`, 400)
      );
    }

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  }
);

export const approveUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { decision, decline_reason } = req.body;
    const updatedData: any = {
      isVerified: decision === "yes" ? true : false,
    };
    if (decline_reason) {
      updatedData.decline_reason = decline_reason;
    }
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: updatedData,
      include: { joinedEqubs: true },
    });

    if (!user) {
      return next(
        new AppError(`User with ID ${req.params.id} does not exist`, 400)
      );
    }
    console.log("id user controller", req.params.id);
    addKycPoint(req.params.id);
    await prisma.activity.create({
      data: {
        action: Permissions.user,
        staffId: req.staff?.id!,
        userId: user.id,
        description: `${req.staff?.fullName} ${
          decision === "yes" ? "approved" : "declined"
        } a user - ${user.fullName}.`,
      },
    });
    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  }
);

export const deleteUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;

    // Delete related records in the EquberUser table
    await prisma.equberUser.deleteMany({
      where: {
        userId: userId,
      },
    });
    await prisma.payment.deleteMany({
      where: {
        userId: userId,
      },
    });
    await prisma.notification.deleteMany({
      where: {
        userId: userId,
      },
    });

    // Delete the User record
    const user = await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    res.status(200).json({
      status: "success",
    });
  }
);
