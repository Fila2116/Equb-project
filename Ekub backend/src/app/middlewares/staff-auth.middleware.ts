import { NextFunction, Request, Response } from "express";
import { promisify } from "util";
import jwt, { JwtPayload } from 'jsonwebtoken'
import { cleanEnv, str } from "envalid";
import prisma from "../config/db.config";
import { catchAsync } from "../config/error.config";
import AppError from "../shared/errors/app.error";
import { Permissions } from "@prisma/client";

const env = cleanEnv(process.env, {
    JWT_ACCESS_SECRET_KEY: str(),
    JWT_ACCESS_EXPIRES_IN: str(),
    JWT_REFRESH_SECRET_KEY: str(),
    JWT_REFRESH_EXPIRES_IN: str(),
  });

export const verifyStaff = catchAsync(
  async (req: Request, _: Response, next: NextFunction) => {
    let token = null;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return next(new AppError("Your not logged in", 401));
    }


  //Verify token
  
  //@ts-ignore
  const {id} = await promisify(jwt.verify)(
    token,
    //@ts-ignore
    env.JWT_ACCESS_SECRET_KEY
  ); 

  const staff = await prisma.staff.findUnique({
    where: {
      id:id,
    },include:{role:true}
  });

  if (!staff) {
    return next(
      new AppError("The staff related to the token no longer exists", 401)
    );
  }

  req.staff = staff;
  req.isAdminRole = staff.role.type==='super_admin'
  next();
  }
);

export const optionalVerifyStaff = catchAsync(
  async (req: Request, _: Response, next: NextFunction) => {
    let token = null;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      req.isAdminRole = false;
      return next();
    }

    //Verify token
  
  //@ts-ignore
  const {id} = await promisify(jwt.verify)(
    token,
    //@ts-ignore
    env.JWT_ACCESS_SECRET_KEY
  ); 

  const staff = await prisma.staff.findUnique({
    where: {
      id:id,
    },include:{role:true}
  });

  if (!staff) {
    return  next();
  }

  req.staff = staff;
  req.isAdminRole = staff.role.type==='admin'
  next();
  }
);

export const restrictStaff = (permission: string) =>
  catchAsync(async (req: Request, _: Response, next: NextFunction) => {
    if (req.staff) {
      //@ts-ignore
      const permissions:Permissions = req.staff.role.permissions;
      if(permissions.includes(Permissions.all)){
        return next();
      }
      if (!permissions.includes(permission)) {
        return next(
          new AppError("You're not allowed to perform current operation", 403)
        );
      }
    }
    next();
  });
