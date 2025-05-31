import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { QueryInterface } from "../../../shared/interfaces/query.interface";
import prisma from "../../../config/db.config";
import { catchAsync } from "../../../config/error.config";
import AppError from "../../../shared/errors/app.error";
import { hashedString } from "../../../utils/hashedText";

import {
  RESOURCES,
  DESTINANTIONS,
  FILTERS,
  multerConfig,
} from "../../../config/multer.config";
import MailService from "../../../shared/mail/services/mail.service";
import { Permissions } from "@prisma/client";

const upload = multerConfig(
  RESOURCES.AVATAR,
  DESTINANTIONS.IMAGE.AVATAR,
  FILTERS.IMAGE
);

/**
 * Upload Middleware
 */
export const uploadImage = {
  pre: upload.single("avatar"),
  post: (req: Request, _: Response, next: NextFunction) => {
    if (req.file) {
      req.body.avatar = req.file.filename;
    }
    next();
  },
};

export const getStaffs = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as unknown as QueryInterface;
    const page = Number(query._page) || 1;
    const limit = Number(query._limit) || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};

    // Add search functionality
    if (query._search) {
      filter.OR = [
        {
          firstName: {
            contains: query._search,
            mode: "insensitive", // Case-insensitive search
          },
        },
        {
          lastName: {
            contains: query._search,
            mode: "insensitive", // Case-insensitive search
          },
        },
        {
          email: {
            contains: query._search,
            mode: "insensitive", // Case-insensitive search
          },
        },
      ];
    }

    const [staffs, total] = await Promise.all([
      prisma.staff.findMany({
        where: filter,
        include: {
          role: {
            select: {
              name: true,
              id: true,
            },
          },
        },
        take: limit,
        skip,
      }),
      prisma.staff.count({
        where: filter,
      }),
    ]);

    res.status(200).json({
      status: "success",
      data: {
        staffs,
        meta: {
          page,
          limit,
          total,
        },
      },
    });
  }
);
export const getExportStaffs = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as unknown as QueryInterface;
    const filter: any = {};

    // Add search functionality
    if (query._search) {
      filter.OR = [
        {
          firstName: {
            contains: query._search,
            mode: "insensitive", // Case-insensitive search
          },
        },
        {
          lastName: {
            contains: query._search,
            mode: "insensitive", // Case-insensitive search
          },
        },
        {
          email: {
            contains: query._search,
            mode: "insensitive", // Case-insensitive search
          },
        },
      ];
    }

    const [staffs, total] = await Promise.all([
      prisma.staff.findMany({
        where: filter,
        include: {
          role: {
            select: {
              name: true,
              id: true,
            },
          },
        },
      }),
      prisma.staff.count({
        where: filter,
      }),
    ]);

    res.status(200).json({
      status: "success",
      data: {
        staffs,
        meta: {
          total,
        },
      },
    });
  }
);

export const getStaff = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const staff = await prisma.staff.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!staff) {
      return next(
        new AppError(`Staff with ID ${req.params.id} does not exist`, 400)
      );
    }

    res.status(200).json({
      status: "success",
      data: {
        staff,
      },
    });
  }
);

export const createStaff = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log(" req.file on controller");
    console.log(req.file);
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      roleId,
      fileName,
      branchId,
      password,
    } = req.body;
    console.log(`avatar: ${fileName}`);
    // const password = uuidv4().split("-")[0];
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      return next(
        new AppError(`Role with ID ${req.params.id} does not exist`, 400)
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
    const hashedPassword = await hashedString(password);

    const mainBranch = await prisma.branch.findFirst({
      where: { isMain: true },
    });

    console.log(
      `firstName: ${firstName}, lastName: ${lastName}, email: ${email}, phoneNumber: ${phoneNumber}, roleId: ${roleId}, fileName: ${fileName}`
    );

    const staff = await prisma.staff.create({
      data: {
        firstName: firstName,
        lastName: lastName,
        fullName: `${firstName} ${lastName}`,
        email: email,
        phoneNumber: phoneNumber,
        password: hashedPassword,
        roleId: roleId,
        isActive: true,
        avatar: fileName ? fileName : "",
        branchId: branchId ? branchId : mainBranch?.id || "",
      },
      include: {
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    MailService.sendStaffWelcome(staff.email, staff.fullName!, password);

    await prisma.activity.create({
      data: {
        action: Permissions.staff,
        staffId: req.staff?.id!,
        doneToStaffId: staff.id,
        description: `${req.staff?.fullName} added ${role.name} - ${staff.fullName}.`,
      },
    });

    res.status(200).json({
      status: "success",
      data: {
        staff,
      },
    });
  }
);

export const updateStaff = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      roleId,
      fileName,
      state
    } = req.body;
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      return next(
        new AppError(`Role with ID ${req.params.id} does not exist`, 400)
      );
    }
    let updatedData: any = {
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      email,
      phoneNumber,
      roleId,
      state,
    };
    if (password) updatedData.password = await hashedString(password);
    if (fileName) updatedData.avatar = fileName;
    const staff = await prisma.staff.update({
      where: { id: req.params.id },
      data: updatedData,
      include: {
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!staff) {
      return next(
        new AppError(`Staff with ID ${req.params.id} does not exist`, 400)
      );
    }
    await prisma.activity.create({
      data: {
        action: Permissions.staff,
        staffId: req.staff?.id!,
        doneToStaffId: staff.id,
        description: `${req.staff?.fullName} updated ${role.name} - ${staff.fullName}.`,
      },
    });
    res.status(200).json({
      status: "success",
      data: {
        staff,
      },
    });
  }
);

export const deleteStaff = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const sraffId = req.params.id;

    // Delete related records in the Payment table
    // await prisma.payment.deleteMany({
    //   where: {
    //     equbId: equbId,
    //   },
    // });

    // Delete the Equb record
    const equb = await prisma.staff.delete({
      where: {
        id: sraffId,
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
