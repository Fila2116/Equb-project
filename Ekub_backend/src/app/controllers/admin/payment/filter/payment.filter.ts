import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../../../config/error.config";
import { IFilter } from "../../../../shared/interfaces/filter.interface";
import { GetPaymentsQueryInterface } from "../../../../interfaces/payment-query.interface";

export const getPayments = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as unknown as GetPaymentsQueryInterface;
    // Get the start and end date from the query
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    let filter: IFilter = {};
    if (query.state) {
      filter = {
        ...filter,
        state: query.state,
      };
    }
    if (query.paymentMethod) {
      filter = {
        ...filter,
        paymentMethod: query.paymentMethod,
      };
    }
    if (query.approved) {
      filter = {
        ...filter,
        approved: query.approved == "true" ? true : false,
      };
    }
    if (query._search) {
      filter = {
        ...filter,
        equbber: {
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
        },


      };
    }

    // Add date filtering to the where clause if startDate and endDate are provided
    if (startDate && endDate) {
      filter = {
        ...filter,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      };
    }
    // Add date filtering to the where clause if company BankId
    if (query.companyBankId) {
      filter = {
        ...filter,
        companyBankAccountId: query.companyBankId,
      };
    }
    // Add date filtering to the where clause if equbId
    if (query.equbId) {
      filter = {
        ...filter,
        equbId: query.equbId,
      };
    }

    //  req.filter = filter;
    req.filters = filter;

    // Sorting logic
    let sortOrder: any = {};
    if (query.sortBy) {
      if (query.sortBy === "newest") {
        sortOrder = { createdAt: "desc" };
      } else if (query.sortBy === "oldest") {
        sortOrder = { createdAt: "asc" };
      }
    }

    req.sortOrder = sortOrder;
    next();
  }
);
