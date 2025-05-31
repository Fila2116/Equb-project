import { NextFunction, Request, Response } from "express";

import prisma from "../../../config/db.config";
import { catchAsync } from "../../../config/error.config";

export const getEqubStat = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
   

    const [equbers, equbs,activeEqubs,closedEqubs] =  await Promise.all([
        prisma.equber.count(),
        prisma.equb.count(),
        prisma.equb.count({where:{status:'started'}}),
        prisma.equb.count({where:{status:'completed'}}),
    ]) 

    res.status(200).json({
      status: "success",
      data: {
        statistics:{
            equbs,
            equbers,
            activeEqubs,
            closedEqubs
        },
      },
    });
  }
);