import { NextFunction, Request, Response } from "express";
import prisma from "../../../../config/db.config";
import { catchAsync } from "../../../../config/error.config";
import { GetEqubsQueryInterface } from "../../../../interfaces/equb.interface";
import { IFilter } from "../../../../shared/interfaces/filter.interface";
import AppError from "../../../../shared/errors/app.error";

export const getEqubs = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as unknown as GetEqubsQueryInterface;
  
    if (query.equbType) {
      req.filters = {
        ...req.filters,
        equbTypeId: query.equbType,
      };
    }
    if (query.equbCategory) {
      req.filters = {
        ...req.filters,
        equbCategoryId: query.equbCategory,
      };
    }
    if (query.user) {
      if (query.status === "joined") {
        req.filters = {
          ...req.filters,
          equbers: {
            some: {
              users: {
                some: {
                  userId: query.user,
                },
              },
            },
          },
        };
      }

      if (query.status === "pending") {
        req.filters = {
          ...req.filters,
          equberRequests: {
            some: {
              users: {
                some: {
                  userId: query.user,
                },
              },
            },
          },
        };
      }
    }

    if (query._search) {
      req.filters = {
        ...req.filters,
        name: {
          contains: query._search,
          mode: "insensitive",
        },
      };
    }
    // let sortOrder: any = {};
    // if (query.sortBy) {
    //   if (query.sortBy === "newest") {
    //     sortOrder = { nextRoundDate: "desc" };
    //   } else if (query.sortBy === "oldest") {
    //     sortOrder = { nextRoundDate: "asc" };
    //   }
    // }

    // Attach filter and sortOrder to the request object
    // (req as any).sortOrder = sortOrder;
    // req.filters = req.query;
    // console.log(`req.filters from middleware`, req.query);
    // let equberUsers = await prisma.equberUser.findMany({where:{userId:query.user},include:{
    //     equber:{
    //       include:{
    //     equb:true
    //       }
    //     },
    //     equberRequest:{
    //       include:{
    //     equb:true
    //       }
    //     }

    // }});

    // return res.json({
    //     msg:"success",
    //     data:{
    //         joinedEqubs:equberUsers.map(equberUser=>equberUser.equber?.equb).filter(equb=>equb!=null),
    //         pendingEqubs:equberUsers.map(equberUser=>equberUser.equberRequest?.equb).filter(equb=>equb!=null)
    //     }
    // })

    next();
  }
);
