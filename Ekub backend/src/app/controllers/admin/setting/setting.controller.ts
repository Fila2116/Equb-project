import { NextFunction, Request, Response } from "express";

import { QueryInterface } from "../../../shared/interfaces/query.interface";
import prisma from "../../../config/db.config";
import { catchAsync } from "../../../config/error.config";
import AppError from "../../../shared/errors/app.error";
import { Permissions, SettingType, SettingTypeValue } from "@prisma/client";


export const getSettings = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as unknown as QueryInterface;
    const page = Number( query._page) || 1 ;
    const limit =Number( query._limit) || 10;
    const skip = Number((page - 1) * limit);

    const [settings, total] =  await Promise.all([prisma.setting.findMany({
      take: limit,
      skip,
    }),prisma.setting.count()]) 

    res.status(200).json({
      status: "success",
      data: {
        settings,
        meta: {
          page,
          limit,
          total,
        },
      },
    });
  }
);

export const getSettingTypes = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    
const settingTypes = Object.values(SettingType);

    res.status(200).json({
      status: "success",
      data: {
        settingTypes
      },
    });
  }
);
export const getSettingValueTypes = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    
const settingTypes = Object.values(SettingTypeValue);

    res.status(200).json({
      status: "success",
      data: {
        settingTypes
      },
    });
  }
);

export const getSetting = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const setting = await prisma.setting.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!setting) {
      return next(
        new AppError(`Setting with ID ${req.params.id} does not exist`, 400)
      );
    }

    res.status(200).json({
      status: "success",
      data: {
        setting,
      },
    });
  }
);

export const createSetting = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
   SettingType
    

    const setting = await prisma.setting.create({
        data:req.body
    })



    res.status(200).json({
      status: "success",
      data: {
        setting,
      },
    });
  }
);


export const updateSetting = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    
    const setting = await prisma.setting.update({where:{id:req.params.id},data:req.body});

    if (!setting) {
      return next(
        new AppError(`Setting with ID ${req.params.id} does not exist`, 400)
      );
    }
   
    res.status(200).json({
      status: "success",
      data: {
        setting,
      },
    });
  }
);

export const deleteSetting = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const setting = await prisma.setting.delete({
      where: {
        id: req.params.id,
      },
    });

    if (!setting) {
      return next(
        new AppError(`Setting with ID ${req.params.id} does not exist`, 400)
      );
    }

    res.status(200).json({
      status: "success",
      msg: 'setting deleted',
    });
  }
);
