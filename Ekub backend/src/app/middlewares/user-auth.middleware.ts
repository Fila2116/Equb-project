import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import AppError from "../shared/errors/app.error";
import { promisify } from "util";
import { cleanEnv, str } from "envalid";

const env = cleanEnv(process.env, {
  JWT_ACCESS_SECRET_KEY: str(),
  JWT_ACCESS_EXPIRES_IN: str(),
  JWT_REFRESH_SECRET_KEY: str(),
  JWT_REFRESH_EXPIRES_IN: str(),
});

export async function verifyUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let token = null;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  console.log("req.headers.authorization");
  console.log(req.headers.authorization);
  if (!token) {
    return next(new AppError("Your not logged in", 401));
  }

  //Verify token
  try {
    const payload = (await promisify(jwt.verify)(
      token,
      //@ts-ignore
      env.JWT_ACCESS_SECRET_KEY
    )) as JwtPayload;

    req.user = payload.user;
    next();
  } catch (err) {
    console.log(err);
    res.status(401).json({ msg: "Token is not valid" });
  }
}

export function restrictUser(req: Request, res: Response, next: NextFunction) {
  if (req.user?.id != req.params.id) {
    return next(new AppError(`You can only update your own profile`, 400));
  }
  next();
}
