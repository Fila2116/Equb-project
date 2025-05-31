import { NextFunction, Request, Response } from "express";

import { QueryInterface } from "../../../shared/interfaces/query.interface";
import prisma from "../../../config/db.config";
import { catchAsync } from "../../../config/error.config";
import AppError from "../../../shared/errors/app.error";
import { Permissions } from "@prisma/client";

export const getBanks = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as unknown as QueryInterface;
    const page = Number(query._page) || 1;
    const limit = Number(query._limit) || 10;
    const skip = Number((page - 1) * limit);

    const [banks, total] = await Promise.all([
      prisma.bank.findMany({
        take: limit,
        skip,
      }),
      prisma.bank.count(),
    ]);

    res.status(200).json({
      status: "success",
      data: {
        banks,
        meta: {
          page,
          limit,
          total,
        },
      },
    });
  }
);

export const getBank = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const bank = await prisma.bank.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!bank) {
      return next(
        new AppError(`Bank with ID ${req.params.id} does not exist`, 400)
      );
    }

    res.status(200).json({
      status: "success",
      data: {
        bank,
      },
    });
  }
);

export const createBank = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, description } = req.body;

    const bank = await prisma.bank.create({
      data: {
        name: name,
        description: description ? description : "",
      },
    });

    await prisma.activity.create({
      data: {
        action: Permissions.bank,
        staffId: req.staff?.id!,
        bankId: bank.id,
        description: `${req.staff?.fullName} added a new Bank - ${bank.name}.`,
      },
    });

    res.status(200).json({
      status: "success",
      data: {
        bank,
      },
    });
  }
);

export const updateBank = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, description } = req.body;
    const updatedData: any = {
      name,
    };
    if (description) updatedData.description = description;
    const bank = await prisma.bank.update({
      where: { id: req.params.id },
      data: updatedData,
    });

    if (!bank) {
      return next(
        new AppError(`Bank with ID ${req.params.id} does not exist`, 400)
      );
    }

    await prisma.activity.create({
      data: {
        action: Permissions.bank,
        staffId: req.staff?.id!,
        bankId: bank.id,
        description: `${req.staff?.fullName} updated a Bank.`,
      },
    });

    res.status(200).json({
      status: "success",
      data: {
        bank,
      },
    });
  }
);

export const deleteBank = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    await prisma.bankAccount.deleteMany({
      where: {
        bankId: req.params.id,
      },
    });

    // Delete the bank
    const bank = await prisma.bank.delete({
      where: {
        id: req.params.id,
      },
    });

    res.status(200).json({
      status: "success",
      message: "Bank deleted successfully",
    });
  }
);
export const deleteCompanyBank = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const bank = await prisma.companyBankAccount.delete({
      where: {
        id: req.params.id,
      },
    });

    if (!bank) {
      return next(
        new AppError(`Bank with ID ${req.params.id} does not exist`, 400)
      );
    }

    res.status(200).json({
      status: "success",
      message: "Bank deleted successfully",
    });
  }
);
