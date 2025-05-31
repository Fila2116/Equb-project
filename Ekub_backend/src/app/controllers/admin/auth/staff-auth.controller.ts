import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../../config/db.config";
import AppError from "../../../shared/errors/app.error";
import { cleanEnv, str } from "envalid";
import { catchAsync } from "../../../config/error.config";
import { promisify } from "util";
import SMSService from "../../../shared/sms/services/sms.service";
import { AxiosResponse } from "axios";
import { OtpResponse } from "../../../shared/sms/interfaces/sms.interface";
// geolocation.ts
import NodeGeocoder from 'node-geocoder';
import MailService from "../../../shared/mail/services/mail.service";

const env = cleanEnv(process.env, {
  JWT_ACCESS_SECRET_KEY: str(),
  JWT_ACCESS_EXPIRES_IN: str(),
  JWT_REFRESH_SECRET_KEY: str(),
  JWT_REFRESH_EXPIRES_IN: str(),
});

const getStaff = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
      status: "success",
      data: {
        user: req.staff,
      },
    });
  }
);
const options: NodeGeocoder.Options = {
  provider: 'openstreetmap', // or 'google', 'opencage', etc.
};

const geocoder = NodeGeocoder(options);
export async function getLocationName(
  latitude: number,
  longitude: number
): Promise<{ city?: string; state?: string; country?: string }> {
  try {
    const res = await geocoder.reverse({ lat: latitude, lon: longitude });
    const loc = res[0];

    return {
      city: loc.city,
      state: loc.state,
      country: loc.country,
    };
  } catch (err) {
    console.error('Geocoding failed:', err);
    return { city: 'Unknown', state: 'Unknown', country: 'Unknown' };
  }
}
const loginStaff = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    //See if a Building with that admin exists
    let user = await prisma.staff.findUnique({
      where: { email: email },
      include: { role: true },
    });
    if (!user) {
      return next(new AppError(`Staff not found`, 400));
    }
    // if (user.BolckEndDate && user.BolckEndDate > new Date()) {
    //   return next(new AppError(`You have tried incorrect attempts. The system is locked. Please try again after 30 minutes.`, 400));
    // }
    // Check Password

    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
      // Increment the failure count
      const FailureCount = ++user.FailureCount;
      console.log("FailureCount", FailureCount);
      // If the failure count reaches 5, block the user for 5 minutes
      console.log("password", password);
      // Update the user record in the database
      await prisma.staff.update({
        where: { id: user.id }, // Assuming 'user.id' is the unique identifier for the user
        data: {
          FailureCount: FailureCount
        },
      });
      // If the failure count reaches 5, block the user for 5 minutes
      if (user.FailureCount >= 5) {
        // Update the user record in the database
        await prisma.staff.update({
          where: { id: user.id }, // Assuming 'user.id' is the unique identifier for the user
          data: {
            BolckEndDate: new Date(Date.now() + 30 * 60 * 1000) // Block for 30 minutes from now
          },
        });
        // if (latitude && longitude) {
        //   // Get the user's IP address
        //   const location = await getLocationName(latitude, longitude);

        //   // Send an email to the admin with the user's details
        //   const staff = await prisma.staff.findFirst({
        //     where: {
        //       role: {
        //         name: "Super Admin"
        //       },
        //     },
        //   });

        //   if (staff) {
        //     await MailService.sendAdminLoginAlertMail(staff.email ?? '', user, location.city ?? '', location.state ?? '', location.country ?? '');
        //   }
        // }

        // Send an email to the admin with the user's details
        const staff = await prisma.staff.findFirst({
          where: {
            role: {
              name: "Super Admin"
            },
          },
        });

        if (staff) {
          await MailService.sendAdminLoginAlertMailWithOutLocation(staff.email ?? '', user);
        }

        // Return an error message if the credentials are invalid
      }
      return next(new AppError(`Invalid credentials`, 400));
    }

    //TODO: Reset the count of fail here
    // Update the user record in the database
    await prisma.staff.update({
      where: { id: user.id }, // Assuming 'user.id' is the unique identifier for the user
      data: {
        FailureCount: 0,
        BolckEndDate: null,
      },
    });
    //Return jsonwebtoken :to login the user
    const payload = {
      id: user.id,
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
      status: "success",
      data: {
        user,
        accessToken,
        refreshToken,
      },
    });


  });

const verify = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { otpCode } = req.body;
    console.log("req.user");
    console.log(req.staff);
    //See if a Building with that admin exists

    let user = await prisma.staff.findFirst({
      where: {
        AND: [
          { adminOtpCode: otpCode },
          { OtpCodeExpires: { gte: new Date() } }
        ]
      }
    });
    console.log("otpCode", otpCode);

    console.log("found user", user);
    if (!user) {
      return next(new AppError(`Staff not found`, 400));
    }
    else {
      res.status(200).json({
        status: "success",
        data: {
          isVerified: true,
        },
      });
    }
  }
);
const sendOtpToAdmin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body);
    const staff = await prisma.staff.findFirst({
      where: {
        role: {
          name: "Super Admin"
        },
      },
    });

    if (staff) {

      const { data } = (await SMSService.sendOtp(
        staff.phoneNumber,
        "Your verification code is "
      )) as AxiosResponse<OtpResponse>;
      console.log("data", data);
      //Update the staff with the OTP code and expiration time
      await prisma.staff.update({
        where: { id: staff.id },
        data: {
          adminOtpCode: data.response.code,
          OtpCodeExpires: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
        },
      });
      return res.json({
        status: data.acknowledge,
        code: data.response.code,
      });
    }

  }
);

export const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("req.body.emailOrPhoneNumber", req.body.emailOrPhoneNumber);
    const staff = await prisma.staff.findFirst({
      where: {
        OR: [
          { email: req.body.emailOrPhoneNumber },
          { phoneNumber: req.body.emailOrPhoneNumber },
        ],
      },
    });

    if (!staff) {
      return next(new AppError("There is no staff with this phone number or email", 404));
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    await prisma.staff.update({
      where: { id: staff.id },
      data: { passwordResetToken: otp },
    });
    const isEmail = /^[^\s@]+@(gmail\.com|companyname\.com)$/.test(req.body.emailOrPhoneNumber);

    const isPhone = /^(\+2519\d{8}|09\d{8})$/.test(req.body.emailOrPhoneNumber);

    console.log("this is phone......", isPhone);


    if (isEmail) {
      await MailService.sendOTPMail(
        staff.email!,
        staff.fullName!,
        otp
      );
    }
    else if (isPhone) {
      await SMSService.sendSms(
        staff.phoneNumber!,
        `hey ${staff.fullName}, Your verification code is : ${otp} `
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
  const user = await prisma.staff.findFirst({
    where: { passwordResetToken: req.body.otp },
  });

  if (!user) {
    return next(new AppError("Invalid or expired otp", 404));
  }

  const password = await bcrypt.hash(req.body.password, 10);

  await prisma.staff.update({
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
export default { loginStaff, getStaff, verify, sendOtpToAdmin, forgotPassword, resetPassword };
