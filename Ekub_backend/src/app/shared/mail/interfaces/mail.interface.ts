export interface ApprovalEmailProps {
  fullName: string;
}
export interface StaffWelcomeProps {
  fullName: string;
  password: string;
}

export interface OtpVerifyProps {
  fullName: string;
  otp: string;
}
export interface OtpVerifyRegisterProps {
  otp: string;
}

export interface EqubNotificationProps {
  equbName: string;
  time: string;
}
