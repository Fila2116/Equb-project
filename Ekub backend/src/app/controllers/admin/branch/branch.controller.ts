import { NextFunction, Request, Response } from "express";

import prisma from "../../../config/db.config";
import { catchAsync } from "../../../config/error.config";
import AppError from "../../../shared/errors/app.error";
import { Permissions } from "@prisma/client";

import { QueryInterface } from "../../../shared/interfaces/query.interface";

export const getBranches = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as unknown as QueryInterface;

    const page = Number( query._page) || 1 ;
    const limit =Number( query._limit) || 10;
    const skip = Number((page - 1) * limit);

    const [branches, total] =  await Promise.all([prisma.branch.findMany({
      take: limit,
      skip,
    }),prisma.branch.count()]) 

    res.status(200).json({
      status: "success",
      data: {
        branches,
        meta: {
          page,
          limit,
          total,
        },
      },
    });
  }
);
export const getBranch = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const branch = await prisma.branch.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!branch) {
      return next(
        new AppError(`Branch with ID ${req.params.id} does not exist`, 400)
      );
    }

    res.status(200).json({
      status: "success",
      data: {
        branch,
      },
    });
  }
);

export const createBranch = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
   const {name,city,phoneNumber} = req.body;
    
    const branch = await prisma.branch.create({
        data:{
            name:name,
            city:city,
            phoneNumber:phoneNumber?phoneNumber:''
        }
    })
    await prisma.activity.create({
      data:{
       action:Permissions.branch,
       staffId:req.staff?.id!,
       branchId:branch.id,
       description:`${req.staff?.fullName} created a new branch - ${branch.name}.`
      }
   })
    res.status(200).json({
      status: "success",
      data: {
        branch,
      },
    });
  }
);

export const updateBranch = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {name,city,phoneNumber} = req.body;
const updatedData:any = {
    name,city,phoneNumber
}
if(phoneNumber) updatedData.phoneNumber = phoneNumber;
    const branch = await prisma.branch.update({where:{id:req.params.id},data:updatedData,
    });

    if (!branch) {
      return next(
        new AppError(`Branch with ID ${req.params.id} does not exist`, 400)
      );
    }
    await prisma.activity.create({
      data:{
       action:Permissions.branch,
       staffId:req.staff?.id!,
       description:`${req.staff?.fullName} updated a branch.`,
       branchId:branch.id
      }
   })
    res.status(200).json({
      status: "success",
      data: {
        branch,
      },
    });
  }
);
