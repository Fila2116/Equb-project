import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import axios, { AxiosResponse } from "axios";
import { imageUrlToBase64 } from "../../../utils/image-to-base-64.util";
import prisma from "../../../config/db.config";
import AppError from "../../../shared/errors/app.error";
import { promisify } from "util";
import { cleanEnv, str } from "envalid";
import { catchAsync } from "../../../config/error.config";
// import { createPasswordResetToken } from "./user-auth.helper";
import SMSService from "../../../shared/sms/services/sms.service";
import { OtpResponse } from "../../../shared/sms/interfaces/sms.interface";
import {
  RESOURCES,
  DESTINANTIONS,
  FILTERS,
  multerConfig,
} from "../../../config/multer.config";
import MailService from "../../../shared/mail/services/mail.service";
import { Prisma } from "@prisma/client";

const env = cleanEnv(process.env, {
  JWT_ACCESS_SECRET_KEY: str(),
  JWT_ACCESS_EXPIRES_IN: str(),
  JWT_REFRESH_SECRET_KEY: str(),
  JWT_REFRESH_EXPIRES_IN: str(),
});

const upload = multerConfig(
  RESOURCES.AVATAR,
  DESTINANTIONS.IMAGE.AVATAR,
  FILTERS.IMAGE
);

/**
 * Upload Middleware
 */
const uploadImage = {
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

const sendOtp = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body);
    const { to } = req.body;
    //See if a Building with that admin exists

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: to },
          { phoneNumber: to },
        ],
      },
    });
    // const user = await prisma.user.findUnique({ where: { phoneNumber: to } });

    if (user) {
      return next(new AppError(`Phone number or email exists.`, 400));
    }
    const isEmail = /^[^\s@]+@(gmail\.com|companyname\.com)$/.test(to);

    const isPhone = /^\+251\d{9}$/.test(to); // Adjust length as per your requirements

    if (isEmail) {

      const otp = Math.floor(1000 + Math.random() * 9000).toString();
console.log("otp.....", otp);
      await MailService.sendOTPMailRegister(to, otp);

      await prisma.inActiveUser.create({
        data: {
          email: to,
        },
      });

      return res.status(200).json({
        status: "success",
        message: "otp sent successfuly",
        code: otp,
      });
    }
    else if (isPhone) {
      const { data } = (await SMSService.sendOtp(
        to,
        "Your verification code is "
      )) as AxiosResponse<OtpResponse>;

      //create inactive user
      console.log("data", data.response.code);
      await prisma.inActiveUser.create({
        data: {
          phoneNumber: to,
        },
      });
      return res.json({
        status: data.acknowledge,
        code: data.response.code,
      });
    }


  }
);


const signupUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("req.body");
    console.log(req.body);
    const {
      username,
      firstName,
      lastName,
      phoneNumber,
      email,
      password,
      fileName,
    } = req.body;
    try {
      //Encrypt password
      let hashedPassword = "";
      if (password) {
        const salt = await bcrypt.genSalt(10);
        hashedPassword = await bcrypt.hash(password, salt);
      }
      //Check if user already exists and Delete it from inactive user table
      const existingUser = await prisma.inActiveUser.findFirst({
        where: {
          OR: [
            { email: email },
            { phoneNumber: phoneNumber },
          ],
        },
      });

      if (existingUser) {
        await prisma.inActiveUser.deleteMany({
          where: {
            OR: [
              { email: email },
              { phoneNumber: phoneNumber },
            ],
          },
        });
        console.log("Inactive user(s) deleted.");
      } else {
        console.log("No inactive user found with that phone number.");
      }

      const user = await prisma.user.create({
        data: {
          fullName: `${firstName} ${lastName}`,
          firstName: firstName,
          lastName: lastName,
          phoneNumber: phoneNumber ? phoneNumber : "",
          password: hashedPassword,
          email: email,
          avatar: fileName ? fileName : null,
          ...(username && { username: username }),
        },
      });

      //Return jsonwebtoken :to login the user
      const payload = {
        user: {
          id: user.id,
        },
      };

      const accessToken = await promisify(jwt.sign)(
        payload,
        //@ts-ignore
        env.JWT_ACCESS_SECRET_KEY,
        { expiresIn: env.JWT_ACCESS_EXPIRES_IN }
      );
      const refreshToken = await promisify(jwt.sign)(
        payload,
        //@ts-ignore
        env.JWT_REFRESH_SECRET_KEY,
        {
          expiresIn: env.JWT_REFRESH_EXPIRES_IN,
        }
      );
      res.status(200).json({
        user,
        accessToken,
        refreshToken,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        // Handle unique constraint error
        const uniqueField = (error.meta as any)?.target;
        const fieldName = Array.isArray(uniqueField)
          ? uniqueField.join(", ")
          : uniqueField;
        return next(
          new AppError(
            `The ${fieldName} already exists. Please use a different value.`,
            400
          )
        );
      }

      // Other errors
      console.error("Signup error:", error);
      return next(new AppError("Failed to create user", 500));
    }
  }
);

const getUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.user);
    let user = await prisma.user.findUnique({ where: { id: req?.user?.id } });
    res.json({ user });
  }
);
const loginUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("req.body");
    console.log(req.body);
    const { phoneNumber, password } = req.body;

    //See if a Building with that admin exists
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: phoneNumber },
          { phoneNumber: phoneNumber },
        ],
      },
      include: {
        deviceTokens: {
          select: { token: true },
        },
      },
    });
    if (!user) {
      return next(new AppError(`User not found`, 400));
    }
    console.log("found user", user);
    // console.log(user);
    //Check Password
    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
      return res.status(400).json({
        errors: [{ msg: "Password not correct." }],
      });
    }

    //Return jsonwebtoken :to login the user
    const payload = {
      user: {
        id: user.id,
      },
    };

    const accessToken = await promisify(jwt.sign)(
      payload,
      //@ts-ignore
      env.JWT_ACCESS_SECRET_KEY,
      { expiresIn: env.JWT_ACCESS_EXPIRES_IN }
    );
    const refreshToken = await promisify(jwt.sign)(
      payload,
      //@ts-ignore
      env.JWT_REFRESH_SECRET_KEY,
      {
        expiresIn: env.JWT_REFRESH_EXPIRES_IN,
      }
    );
    res.status(200).json({
      user,
      accessToken,
      refreshToken,
    });
  }
);

export const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: req.body.phoneNumber },
          { phoneNumber: req.body.phoneNumber },
        ],
      },
    });

    if (!user) {
      return next(new AppError("There is no user with this phone number", 404));
    }

    // const token = await createPasswordResetToken(user.email);
    // await MailService.sendResetPasssword(user.email, token, user.role.type.value);
    // const otpRes =( await SMSService.sendOtp(req.body.phoneNumber,'Your OTP for password reset is ')) as unknown as AxiosResponse;
    // const otp = otpRes.data.response.code;
    // console.log('otp',otp);
    // console.log('user',user);
    // Generate a random OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log("otp", otp);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: otp },
    });
    const isEmail = /^[^\s@]+@(gmail\.com|companyname\.com)$/.test(req.body.phoneNumber);

    const isPhone = /^\+251\d{9}$/.test(req.body.phoneNumber); // Adjust length as per your requirements

    if (isEmail) {
      await MailService.sendOTPMail(
        user.email!,
        user.fullName!,
        otp
      );
    }
    else if (isPhone) {
      await SMSService.sendSms(
        user.phoneNumber!,
        `hey ${user.fullName}, Your verification code is : ${otp} `
      );
    }
    return res.status(200).json({
      status: "success",
      message: "otp sent successfuly",
      otp,
    });
  }
);

export const resetPassword = catchAsync(async (req, res, next) => {
  const user = await prisma.user.findFirst({
    where: { passwordResetToken: req.body.otp },
  });
  // const user = await prisma.user.findUnique({
  //   where: {
  //     phoneNumber: req.body.phoneNumber,
  //   },
  // });
  if (!user) {
    return next(new AppError("Invalid or expired otp", 404));
  }

  const password = await bcrypt.hash(req.body.password, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password,
      passwordResetToken: null,
      passwordResetExpiresIn: null,
    },
  });
  res.status(200).json({
    status: "success",
    message: "Password reseted successfuly",
  });
});
export const refreshToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      let token = null;
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
      ) {
        token = req.headers.authorization.split(" ")[1];
      }
      if (!token) {
        return next(new AppError("You did not provide refresh token", 400));
      }

      const payload = await promisify(jwt.verify)(
        token,
        //@ts-ignore
        env.JWT_REFRESH_SECRET_KEY
      );
      //@ts-ignore
      const { id } = payload;

      const newAccessToken = jwt.sign(
        { id },
        env.JWT_ACCESS_SECRET_KEY,
        //@ts-ignore
        {
          expiresIn: env.JWT_ACCESS_EXPIRES_IN,
        }
      );

      const newRefreshToken = jwt.sign(
        { id },
        env.JWT_REFRESH_SECRET_KEY,
        //@ts-ignore
        {
          expiresIn: env.JWT_REFRESH_EXPIRES_IN,
        }
      );

      res.status(200).json({
        status: "success",
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
      });
    } catch (err: any) {
      if (err.name == "TokenExpiredError") {
        next(new AppError("The token has expired", 400));
      }
      if (err.name == "JsonWebTokenError") {
        next(new AppError(`The token is invalid ${err}`, 400));
      }
    }
  }
);
export default {
  uploadImage,
  sendOtp,
  signupUser,
  loginUser,
  getUser,
  forgotPassword,
  resetPassword,
  refreshToken,
};
