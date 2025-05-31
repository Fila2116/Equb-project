import prisma from "../../../config/db.config";
import { catchAsync } from "../../../config/error.config";
import { NextFunction, Request, Response } from "express";
import { formatDate } from "../../../utils/dateFormatter";

export const getNotification = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // const user = await prisma.user.findUnique({
    //   where: {
    //     id: req.params.id,
    //   },
    //   select: {
    //     notifications: true,
    //   },
    // });
    const notification = await prisma.notification.findMany({
      where: {
        userId: req.params.id,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            fullName: true,
          },
        },
        equb: {
          select: { equbType: true, name: true },
        },
      },
    });

    const formattedNotifications = notification.map((notification) => ({
      ...notification,
      createdAt: formatDate(notification.createdAt),
      updatedAt: formatDate(notification.updatedAt),
    }));
    res.status(200).json({
      status: "success",
      data: { notifications: formattedNotifications },
    });
  }
);

export const getNotifications = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // const user = await prisma.user.findUnique({
    //   where: {
    //     id: req.params.id,
    //   },
    //   select: {
    //     notifications: true,
    //   },
    // });
    const notification = await prisma.notification.findMany();

    res.status(200).json({
      status: "success",
      data: { notification },
    });
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
