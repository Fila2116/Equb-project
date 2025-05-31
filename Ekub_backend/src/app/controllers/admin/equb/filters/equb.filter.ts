import { NextFunction, Request, Response } from "express";
import prisma from "../../../../config/db.config";
import { catchAsync } from "../../../../config/error.config";
import { GetEqubsQueryInterface } from "../../../../interfaces/equb.interface";
import { IFilter } from "../../../../shared/interfaces/filter.interface";

export const getAllEqubs = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as unknown as GetEqubsQueryInterface;
    let filter: IFilter = {};
    if (query.branch) {
      filter = {
        ...filter,
        branchId: query.branch,
      };
    }
    if (query._search) {
      filter = {
        ...filter,
        name: query._search,
      };
    }
    if (query.state) {
      filter = {
        ...filter,
        state: query.state,
      };
    }
    // Sorting logic
    // let sortOrder: any = {};
    // if (query.sortBy) {
    //   if (query.sortBy === "newest") {
    //     sortOrder = { nextRoundDate: "desc" };
    //   } else if (query.sortBy === "oldest") {
    //     sortOrder = { nextRoundDate: "asc" };
    //   }
    // }

    // Attach filter and sortOrder to the request object
    (req as any).filter = filter;
    // (req as any).sortOrder = sortOrder;
    next();
  }
);
