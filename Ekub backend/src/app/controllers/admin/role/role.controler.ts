import { NextFunction, Request, Response } from "express";

import { QueryInterface } from "../../../shared/interfaces/query.interface";
import prisma from "../../../config/db.config";
import { catchAsync } from "../../../config/error.config";
import AppError from "../../../shared/errors/app.error";
import { Permissions } from "@prisma/client";

export const getRoles = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as unknown as QueryInterface;
    const page = Number(query._page) || 1;
    const limit = Number(query._limit) || 10;
    const skip = Number((page - 1) * limit);
    const filter: any = {};

    // Add search functionality
    if (query._search) {
      filter.OR = [
        {
          name: {
            contains: query._search,
            mode: "insensitive",
          },
        },
      ];
    }

    const [roles, total] = await Promise.all([
      prisma.role.findMany({
        where: filter,
        take: limit,
        skip,
      }),
      prisma.role.count({ where: filter }),
    ]);

    res.status(200).json({
      status: "success",
      data: {
        roles,
        meta: {
          page,
          limit,
          total,
        },
      },
    });
  }
);

export const getRole = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const role = await prisma.role.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!role) {
      return next(
        new AppError(`Role with ID ${req.params.id} does not exist`, 400)
      );
    }

    res.status(200).json({
      status: "success",
      data: {
        role,
      },
    });
  }
);

export const createRole = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, description, permissions } = req.body;

    const role = await prisma.role.create({
      data: {
        type: "custom",
        description: description,
        permissions: permissions,
        name: name,
      },
    });

    await prisma.activity.create({
      data: {
        action: Permissions.role,
        staffId: req.staff?.id!,
        roleId: role.id,
        description: `${req.staff?.fullName} created a new role - ${role.name}.`,
      },
    });

    res.status(200).json({
      status: "success",
      data: {
        role,
      },
    });
  }
);

export const updateRole = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, description, permissions } = req.body;

    const role = await prisma.role.update({
      where: { id: req.params.id },
      data: {
        name: name,
        description: description,
        permissions: permissions,
      },
    });

    if (!role) {
      return next(
        new AppError(`Role with ID ${req.params.id} does not exist`, 400)
      );
    }
    await prisma.activity.create({
      data: {
        action: Permissions.role,
        staffId: req.staff?.id!,
        roleId: role.id,
        description: `${req.staff?.fullName} updated a role `,
      },
    });
    res.status(200).json({
      status: "success",
      data: {
        role,
      },
    });
  }
);
