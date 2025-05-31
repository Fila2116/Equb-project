import { NextFunction, Request, Response } from "express";

import { QueryInterface } from "../../../shared/interfaces/query.interface";
import prisma from "../../../config/db.config";
import { catchAsync } from "../../../config/error.config";
import AppError from "../../../shared/errors/app.error";
import { Permissions } from "@prisma/client";


export const getBankAccounts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as unknown as QueryInterface;
    const page = Number( query._page) || 1 ;
    const limit =Number( query._limit) || 10;
    const skip = Number((page - 1) * limit);

    const [companyBankAccounts, total] =  await Promise.all([prisma.companyBankAccount.findMany({
      take: limit,
      skip,
    }),prisma.companyBankAccount.count()]) 

    res.status(200).json({
      status: "success",
      data: {
        companyBankAccounts,
        meta: {
          page,
          limit,
          total,
        },
      },
    });
  }
);

export const getAllBankAccounts = catchAsync(
  async (req: Request, res: Response) => {

    const [companyBankAccounts, totalCount] = await Promise.all([
      prisma.companyBankAccount.findMany(),
      prisma.companyBankAccount.count()
    ]);

    res.status(200).json({
      status: "success",
      data: {
        companyBankAccounts,
        totalCount
      },
    });
  }
);



export const getBankAccount = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const companyBankAccount = await prisma.companyBankAccount.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!companyBankAccount) {
      return next(
        new AppError(`Company bank account with ID ${req.params.id} does not exist`, 400)
      );
    }

    res.status(200).json({
      status: "success",
      data: {
        companyBankAccount,
      },
    });
  }
);

export const createBankAccount = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
   const {accountName,accountNumber} = req.body;
    
    const companyBankAccount = await prisma.companyBankAccount.create({
        data:{
            accountName:accountName,
           accountNumber:accountNumber
        }
    });

    await prisma.activity.create({
      data:{
       action:Permissions.company_bank,
       staffId:req.staff?.id!,
       companyBankAccountId:companyBankAccount.id,
       description:`${req.staff?.fullName} added a new Company Bank account - ${companyBankAccount.accountName} , ${companyBankAccount.accountNumber}.`
      }
   })

    res.status(200).json({
      status: "success",
      data: {
        companyBankAccount,
      },
    });
  }
);


export const updateBankAccount = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {accountName,accountNumber} = req.body;
const updatedData:any = {
    accountName,accountNumber
}
    const companyBankAccount = await prisma.companyBankAccount.update({where:{id:req.params.id},data:updatedData});

    if (!companyBankAccount) {
      return next(
        new AppError(`Company Bank Account with ID ${req.params.id} does not exist`, 400)
      );
    }

    await prisma.activity.create({
      data:{
       action:Permissions.company_bank,
       staffId:req.staff?.id!,
       companyBankAccountId:companyBankAccount.id,
       description:`${req.staff?.fullName} updated a Company Bank Account - ${companyBankAccount.accountName}, ${companyBankAccount.accountNumber}.`
      }
   })

    res.status(200).json({
      status: "success",
      data: {
        companyBankAccount,
      },
    });
  }
);
