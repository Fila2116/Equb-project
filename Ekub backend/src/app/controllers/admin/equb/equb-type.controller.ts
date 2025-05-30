import { NextFunction, Request, Response } from "express";

import { QueryInterface } from "../../../shared/interfaces/query.interface";
import prisma from "../../../config/db.config";
import { catchAsync } from "../../../config/error.config";
import AppError from "../../../shared/errors/app.error";
import { Permissions } from "@prisma/client";


export const getEqubTypes = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as unknown as QueryInterface;
    const page = Number( query._page) || 1 ;
    const limit =Number( query._limit) || 10;
    const skip = Number((page - 1) * limit);

    const [equbTypes, total] =  await Promise.all([prisma.equbType.findMany({
      take: limit,
      skip,
    }),prisma.equbType.count()]) 

    res.status(200).json({
      status: "success",
      data: {
        equbTypes,
        meta: {
          page,
          limit,
          total,
        },
      },
    });
  }
);


export const getEqubType = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const equbType = await prisma.equbType.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!equbType) {
      return next(
        new AppError(`Equb type with ID ${req.params.id} does not exist`, 400)
      );
    }

    res.status(200).json({
      status: "success",
      data: {
        equbType,
      },
    });
  }
);

export const createEqubType = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
   const {name,description,interval} = req.body;
    

    const equbType = await prisma.equbType.create({
        data:{
            name:name,
            description:description?description:'',
            interval:Number(interval)
        }
    })
    await prisma.activity.create({
      data:{
       action:Permissions.equb_type,
       staffId:req.staff?.id!,
       equbTypeId:equbType.id,
       description:`${req.staff?.fullName} created a new equb type - ${equbType.name}.`
      }
   })
    res.status(200).json({
      status: "success",
      data: {
        equbType,
      },
    });
  }
);


export const updateEqubType = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {name,description,interval} = req.body;
const updatedData:any = {
    name,
    interval:Number(interval)
}
if(description) updatedData.description = description;
    const equbType = await prisma.equbType.update({where:{id:req.params.id},data:updatedData});

    if (!equbType) {
      return next(
        new AppError(`Equb type with ID ${req.params.id} does not exist`, 400)
      );
    }
    await prisma.activity.create({
      data:{
       action:Permissions.equb_type,
       staffId:req.staff?.id!,
       description:`${req.staff?.fullName} updated an equb type`,
       equbTypeId:equbType.id
      }
   })
    res.status(200).json({
      status: "success",
      data: {
        equbType,
      },
    });
  }
);
