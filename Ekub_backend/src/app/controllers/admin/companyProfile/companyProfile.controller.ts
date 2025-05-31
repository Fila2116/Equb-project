import { NextFunction, Request, Response } from "express";
import prisma from "../../../config/db.config";
import { catchAsync } from "../../../config/error.config";
import AppError from "../../../shared/errors/app.error";

export const getCompanyProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    const [companyProfile, total] = await Promise.all([
      prisma.companyProfile.findMany(),
      prisma.companyProfile.count(),
    ]);

    res.status(200).json({
      status: "success",
      data: {
        companyProfile,
        meta: {
          total,
        },
      },
    });
  }
);
export const getCompanyProfileForHeader = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
  
    const [companyProfile] = await Promise.all([
      prisma.companyProfile.findFirst(),
    ]);

    res.status(200).json({
      status: "success",
      data: {
        companyProfile,
      },
    });
  }
);


export const createCompanyProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { country, city, address, email, tel } = req.body;

    const companyProfile = await prisma.companyProfile.create({
      data: {
        country: country,
        city: city,
        address: address,
        email: email,
        tel: tel,

      },
    });


    res.status(200).json({
      status: "success",
      data: {
        companyProfile,
      },
    });
  }
);

export const updateCompanyProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { country, city, address, email, tel } = req.body;
    const updatedData: any = {
      country,
      city,
      address,
      email,
      tel
    };
    const companyProfile = await prisma.companyProfile.update({
      where: { id: req.params.id },
      data: updatedData,
    });

    if (!companyProfile) {
      return next(
        new AppError(`Company Profile with ID ${req.params.id} does not exist`, 400)
      );
    }


    res.status(200).json({
      status: "success",
      data: {
        companyProfile,
      },
    });
  }
);

export const deleteCompanyProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    // Delete the companyProfile
    const companyProfile = await prisma.companyProfile.delete({
      where: {
        id: req.params.id,
      },
    });

    res.status(200).json({
      status: "success",
      message: "CompanyProfile deleted successfully",
    });
  }
);

