import { NextFunction, Request, Response } from "express";

import { QueryInterface } from "../../../shared/interfaces/query.interface";
import prisma from "../../../config/db.config";
import { catchAsync } from "../../../config/error.config";
import AppError from "../../../shared/errors/app.error";
import { Permissions, State } from "@prisma/client";
import {
  RESOURCES,
  DESTINANTIONS,
  FILTERS,
  multerConfig,
} from "../../../config/multer.config";
const upload = multerConfig(
  RESOURCES.BANNER,
  DESTINANTIONS.IMAGE.BANNER,
  FILTERS.IMAGE
);

/**
 * Upload Middleware
 */
export const uploadImage = {
  pre: upload.single("picture"),
  post: (req: Request, _: Response, next: NextFunction) => {
    console.log("req.file");
    console.log(req.file);
    if (req.file) {
      req.body.picture = req.file.filename;
    }
    next();
  },
};

export const getBanners = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    type StateType = keyof typeof State;
    const query = req.query as unknown as QueryInterface;
    const page = Number(query._page) || 1;
    const limit = Number(query._limit) || 10;
    const state = query.state as StateType;
    const validStates = Object.values(State);

    if (state && !validStates.includes(state)) {
      return next(new AppError(`Invalid state parameter: ${state}`, 400));
    }

    const skip = (page - 1) * limit;
    const filter: any = {};
    if (state) filter.state = state;

    const currentDate = new Date();

    // Fetch banners with filters
    const banners = await prisma.banner.findMany({
      where: filter,
      take: limit,
      skip,
    });
    const SortedBanners = banners.sort((a, b) => {
      const diffA =
        new Date(a.validUntil!).getTime() - new Date(a.validFrom!).getTime();
      const diffB =
        new Date(b.validUntil!).getTime() - new Date(b.validFrom!).getTime();

      return diffA - diffB;
    });

    const updatedBanners = await Promise.all(
      banners.map(async (banner) => {
        if (banner.validUntil) {
          const isExpired = banner.validUntil.getTime() < currentDate.getTime();

          const targetState = isExpired ? "inactive" : "active";

          if (banner.state !== targetState) {
            await prisma.banner.update({
              where: { id: banner.id },
              data: { state: targetState },
            });
            banner.state = targetState;
          }
        }
        return banner;
      })
    );

    const total = await prisma.banner.count({ where: filter });

    res.status(200).json({
      status: "success",
      data: {
        banners: SortedBanners,
        meta: {
          page,
          limit,
          total,
        },
      },
    });
  }
);

export const getBanner = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const banner = await prisma.banner.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!banner) {
      return next(
        new AppError(`Banner with ID ${req.params.id} does not exist`, 400)
      );
    }

    res.status(200).json({
      status: "success",
      data: {
        banner,
      },
    });
  }
);

export const createBanner = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, description, state, validFrom, validUntil, fileName } =
      req.body;

    const endDate = new Date(validUntil);
    endDate.setHours(12, 0, 0, 0);

    const banner = await prisma.banner.create({
      data: {
        name: name,
        description: description ? description : "",
        state: state,
        validFrom: new Date(validFrom),
        validUntil: endDate,
        picture: fileName ? fileName : null,
      },
    });

    await prisma.activity.create({
      data: {
        action: Permissions.banner,
        staffId: req.staff?.id!,
        bannerId: banner.id,
        description: `${req.staff?.fullName} added a new Banner - ${banner.name}.`,
      },
    });

    res.status(200).json({
      status: "success",
      data: {
        banner,
      },
    });
  }
);

export const updateBanner = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, description, state, validFrom, validUntil } = req.body;
    const updatedData: any = {
      name,
    };
    if (state) updatedData.state = state;
    if (description) updatedData.description = description;
    if (validFrom) updatedData.validFrom = new Date(validFrom);
    if (validUntil) updatedData.validUntil = new Date(validUntil);

    // Fetch the current banner to compare dates
    const existingBanner = await prisma.banner.findUnique({
      where: { id: req.params.id },
    });

    if (!existingBanner) {
      return next(
        new AppError(`Banner with ID ${req.params.id} does not exist`, 400)
      );
    }
  if(existingBanner.state==state)
  {
    // Automatically adjust `state` based on `validUntil` date
    const currentDate = new Date();
    if (updatedData.validUntil) {
      if (new Date(updatedData.validUntil) < currentDate) {
        updatedData.state = "inactive";
      } else {
        updatedData.state = "active";
      }
    } else if (
      existingBanner.validUntil &&
      new Date(existingBanner.validUntil) < currentDate
    ) {
      updatedData.state = "inactive";
    }

  }

   
    // Update the banner with the new data
    const banner = await prisma.banner.update({
      where: { id: req.params.id },
      data: updatedData,
    });

    // Record the activity
    await prisma.activity.create({
      data: {
        action: Permissions.banner,
        staffId: req.staff?.id!,
        bannerId: banner.id,
        description: `${req.staff?.fullName} updated a Banner.`,
      },
    });

    res.status(200).json({
      status: "success",
      data: {
        banner,
      },
    });
  }
);
export const deleteBanner= catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const bannerId = req.params.id;

    // Delete related records in the EquberUser table
    await prisma.banner.deleteMany({
      where: {
        id: bannerId,
      },
    });
   
    res.status(200).json({
      status: "success",
    });
  }
);