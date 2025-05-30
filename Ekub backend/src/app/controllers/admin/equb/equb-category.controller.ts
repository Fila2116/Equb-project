import { NextFunction, Request, Response } from "express";

import { QueryInterface } from "../../../shared/interfaces/query.interface";
import prisma from "../../../config/db.config";
import { catchAsync } from "../../../config/error.config";
import AppError from "../../../shared/errors/app.error";
import { Permissions } from "@prisma/client";

export const getEqubCategories = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as unknown as QueryInterface;
    const page = Number(query._page) || 1;
    const limit = Number(query._limit) || 10;
    const skip = Number((page - 1) * limit);

    const [equbCategorys, total] = await Promise.all([
      prisma.equbCategory.findMany({
        take: limit,
        skip,
      }),
      prisma.equbCategory.count(),
    ]);

    res.status(200).json({
      status: "success",
      data: {
        equbCategorys,
        meta: {
          page,
          limit,
          total,
        },
      },
    });
  }
);

export const getEqubCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const equbCategory = await prisma.equbCategory.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!equbCategory) {
      return next(
        new AppError(
          `Equb category with ID ${req.params.id} does not exist`,
          400
        )
      );
    }

    res.status(200).json({
      status: "success",
      data: {
        equbCategory,
      },
    });
  }
);

export const createEqubCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, description, hasReason, isSaving, needsRequest } = req.body;

    const equbCategory = await prisma.equbCategory.create({
      data: {
        name: name,
        description: description ? description : "",
        hasReason: hasReason === "yes" ? true : false,
        needsRequest: needsRequest === "yes" ? false : false,
        isSaving,
      },
    });
    await prisma.activity.create({
      data: {
        action: Permissions.equb_category,
        staffId: req.staff?.id!,
        equbCategoryId: equbCategory.id,
        description: `${req.staff?.fullName} created a new equb category - ${equbCategory.name}.`,
      },
    });
    res.status(200).json({
      status: "success",
      data: {
        equbCategory,
      },
    });
  }
);

export const updateEqubCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, description, hasReason, needsRequest } = req.body;
    const updatedData: any = {
      name,
      hasReason: hasReason === "yes" ? true : false,
      needsRequest: needsRequest === "yes" ? true : false,
    };
    if (description) updatedData.description = description;
    const equbCategory = await prisma.equbCategory.update({
      where: { id: req.params.id },
      data: updatedData,
    });

    if (!equbCategory) {
      return next(
        new AppError(
          `Equb category with ID ${req.params.id} does not exist`,
          400
        )
      );
    }
    await prisma.activity.create({
      data: {
        action: Permissions.equb_category,
        staffId: req.staff?.id!,
        description: `${req.staff?.fullName} updated an equb category`,
        equbCategoryId: equbCategory.id,
      },
    });
    res.status(200).json({
      status: "success",
      data: {
        equbCategory,
      },
    });
  }
);
