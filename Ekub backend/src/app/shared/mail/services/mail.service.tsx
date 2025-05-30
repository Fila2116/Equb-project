import nodemailer from "nodemailer";

import AppError from "../../errors/app.error";

import { cleanEnv, email, str, url } from "envalid";
import { render } from "@react-email/components";
import ApprovalEmail from "../templates/user-approved-template";
import EqubNotification from "../templates/sendEqubNotification.template";
import StaffWelcome from "../templates/staff-welcome.template";
import React from "react";
import OTPVerify,{ OTPVerifyRegister } from "../templates/otp-mail.template";
import { Staff } from "@prisma/client";
const env = cleanEnv(process.env, {
  EMAIL_USERNAME: email(),
  EMAIL_PASSWORD: str(),
});



// let transporter = nodemailer.createTransport({
//   host: "mail.metahudelivery.com",
//   port: 465,
//   secure: true, // true for 465, false for other ports
//   auth: {
//     user: process.env.EMAIL_USERNAME, // generated ethereal user
//     pass: process.env.EMAIL_PASSWORD, // generated ethereal password
//   },
// })
let transporter = nodemailer.createTransport({
  host: "mail.hageregnaequb.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: env.EMAIL_USERNAME, // generated ethereal user
    pass: env.EMAIL_PASSWORD, // generated ethereal password
  },
});

function sendUserApproval(to: string, fullName: string, password: string) {
  return new Promise(async (resolve, reject) => {
    try {
      const html = render(<ApprovalEmail fullName={fullName} />);
      const msg = {
        from: `"Hagerigna equb" <${env.EMAIL_USERNAME}>`, // sender address
        to: to, // list of receivers
        subject: "Welcome", // Subject line
        text: `text msg`, // plain text body
        html: html, // html body
      };
      resolve(await transporter.sendMail(msg));
    } catch (err) {
      reject(new AppError("Something wrong sending the email", 500));
    }
  });
}

function sendStaffWelcome(to: string, fullName: string, password: string) {
  return new Promise(async (resolve, reject) => {
    try {
      const html = render(
        <StaffWelcome fullName={fullName} password={password} />
      );
      const msg = {
        from: `"Hagerigna equb" <${env.EMAIL_USERNAME}>`, // sender address
        to: to, // list of receivers
        subject: "Welcome", // Subject line
        text: `text msg`, // plain text body
        html: html, // html body
      };
      resolve(await transporter.sendMail(msg));
    } catch (err) {
      // reject(new AppError("Something wrong sending the email", 500));
      console.log("Error sending the email");
      console.log(err);
    }
  });
}

function sendOTPMail(
  to: string,
  fullName: string,
  otp: string
) {
  return new Promise(async (resolve, reject) => {
    try {
      const html = render(
        <OTPVerify fullName={fullName} otp={otp} />
      );

      const msg = {
        from: `"Hagerigna Equb" <${env.EMAIL_USERNAME}>`,
        to: to,
        subject: "Your OTP for Password Reset",
        text: `Hello ${fullName}, your OTP for password reset is ${otp}.`,
        html: html,
      };
      resolve(await transporter.sendMail(msg));
    } catch (err) {
      reject(new AppError("Something wrong sending the email", 500));
      console.log("Error sending the email");
      console.log(err);
    }
  });
}


function sendOTPMailRegister(to: string, otp: string) {
  return new Promise(async (resolve, reject) => {
    try {
      const html = render(<OTPVerifyRegister otp={otp} />);

      const msg = {
        from: `"Hagerigna Equb" <${env.EMAIL_USERNAME}>`,
        to: to,
        subject: "Your OTP Verification",
        text: `Hello, your OTP is ${otp}.`,
        html: html,
      };
      resolve(await transporter.sendMail(msg));
    } catch (err) {
      reject(new AppError("Something wrong sending the email", 500));
      console.log("Error sending the email");
      console.log(err);
    }
  });
}

function sendEqubNotification(to: string, time: string, equbName: string) {
  return new Promise(async (resolve, reject) => {
    try {
      const html = render(<EqubNotification time={time} equbName={equbName} />);

      const msg = {
        from: `"Hagerigna Equb" <${env.EMAIL_USERNAME}>`,
        to: to,
        subject: "Winner Announcement Coming Soon!",
        text: `Hello, we want to inform you that the winner for the Equb "${equbName}" will be announced soon at ${time}. Please stay tuned for further updates.`,
        html: html,
      };
      resolve(await transporter.sendMail(msg));
    } catch (err) {
      reject(new AppError("Something wrong sending the email", 500));
      console.log("Error sending the email");
      console.log(err);
    }
  });
}
//Send Email To Admin Page
 function sendAdminLoginAlertMail(adminEmail: string,staff: Staff,city:string,state:string,country:string) {
  return new Promise(async (resolve, reject) => {
    try {

      const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>🚨 User Failed Login Attempts Report</h2>
          <p>The user below has failed to log in more than five times in a row:</p>

          <h3>User Details:</h3>
          <ul>
            <li><strong>Name:</strong> ${staff.fullName}</li>
            <li><strong>Email:</strong> ${staff.email}</li>
          </ul>

          <p><strong>Failed Attempts:</strong> ${staff.FailureCount}</p>
          <p><strong>Location:</strong> ${city}, ${state}, ${country}</p>

          <p>The account is temporarily <strong>locked for 5 minutes</strong>.</p>

          <p>Please investigate if necessary.</p>
          <br />
          <p>— System Notification Service</p>
        </div>
      `;

      const msg = {
        from: `"Hagerigna Equb" <${env.EMAIL_USERNAME}>`,
        to: adminEmail,
        subject: "⚠️ Alert: User Failed Login Attempts",
        text: `User ${staff.fullName} failed to log in ${staff.FailureCount} times. Location: ${city}, ${country}`,
        html,
      };

      resolve(await transporter.sendMail(msg));
    } catch (err) {
      console.error("Error sending admin alert email:", err);
      reject(new AppError("Failed to send admin login alert email", 500));
    }
  });
}
//Send Email To Admin Page
 function sendAdminLoginAlertMailWithOutLocation(adminEmail: string,staff: Staff) {
  return new Promise(async (resolve, reject) => {
    try {

      const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>🚨 User Failed Login Attempts Report</h2>
          <p>The user below has failed to log in more than five times in a row:</p>

          <h3>User Details:</h3>
          <ul>
            <li><strong>Name:</strong> ${staff.fullName}</li>
            <li><strong>Email:</strong> ${staff.email}</li>
          </ul>

          <p><strong>Failed Attempts:</strong> ${staff.FailureCount}</p>

          <p>The account is temporarily <strong>locked for 5 minutes</strong>.</p>

          <p>Please investigate if necessary.</p>
          <br />
          <p>— System Notification Service</p>
        </div>
      `;

      const msg = {
        from: `"Hagerigna Equb" <${env.EMAIL_USERNAME}>`,
        to: adminEmail,
        subject: "⚠️ Alert: User Failed Login Attempts",
        text: `User ${staff.fullName} failed to log in ${staff.FailureCount} times.`,
        html,
      };

      resolve(await transporter.sendMail(msg));
    } catch (err) {
      console.error("Error sending admin alert email:", err);
      reject(new AppError("Failed to send admin login alert email", 500));
    }
  });
}
const MailService = {
  sendUserApproval,
  sendStaffWelcome,
  sendOTPMail,
  sendOTPMailRegister,
  sendEqubNotification,
  sendAdminLoginAlertMail,
  sendAdminLoginAlertMailWithOutLocation,
};
export default MailService;
