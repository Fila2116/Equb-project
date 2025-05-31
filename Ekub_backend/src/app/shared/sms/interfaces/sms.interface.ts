export interface SmsResponse {
  error: boolean;
  code: number;
  data: {
    error: boolean;
    msg: string;
  };
}

export interface OtpResponse {
  acknowledge: string,
     response: {
       status: string,
       message_id: string,
       message: string,
       to: string,
       code: string,
       verificationId: string
     }
}

