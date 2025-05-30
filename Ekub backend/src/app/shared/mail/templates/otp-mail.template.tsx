import React from "react";
import { Row } from "@react-email/row";
import { Column } from "@react-email/column";
import { Html } from "@react-email/html";
import { Heading } from "@react-email/heading";
import { Button } from "@react-email/button";
import { Container } from "@react-email/container";
import { Section } from "@react-email/section";
import { Text } from "@react-email/text";
import { Hr } from "@react-email/hr";
import {
  OtpVerifyProps,
  OtpVerifyRegisterProps,
} from "../interfaces/mail.interface";

const OTPVerify: React.FC<OtpVerifyProps> = ({ fullName, otp }) => {
  return (
    <>
      <Html>
        <Container>
          <Section>
            <Heading as="h1" style={{ color: "#40507a", fontWeight: "bolder" }}>
              Password Reset Request - Hagerigna Equb
            </Heading>
            <Hr />
            <Text>Hey {fullName},</Text>
            <Hr />
            <Text>We received a request to reset your password.</Text>
            <Text>Use the following OTP to proceed with resetting your password:</Text>
            <Hr />
            <Text
              style={{
                padding: "1rem 2rem",
                background: "#40507a",
                color: "white",
                width: "fit-content",
              }}
            >
              {otp}
            </Text>
            <p>
             Please do not share it with anyone.
            </p>
            <p>If you did not request a password reset, you can safely ignore this email.</p>
            <p>Thank you for using Hagerigna Equb!</p>
          </Section>

          <Section>
            <Text>
              If you encounter any issues or have any questions, feel free to reach out to our support team at
              <Button
                href="mailto:support@hagerignaequb.com"
                style={{ color: "#01890d", marginLeft: "0.3rem" }}
              >
                support@hagerignaequb.com
              </Button>
              .
            </Text>
          </Section>
        </Container>
      </Html>

    </>
  );
};



export const OTPVerifyRegister: React.FC<OtpVerifyRegisterProps> = ({
  otp,
}) => {
  return (
    <>
      <Html>
        <Container>
          <Section>
            <Heading as="h1" style={{ color: "#40507a", fontWeight: "bolder" }}>
              Welcome to Hagerigna Equb!
            </Heading>
            <Hr></Hr>
            {/* <Text> Hey {fullName}.</Text> */}
            <Hr></Hr>
            <Text>Use the following OTP to verify your account:</Text>
            <Hr></Hr>
            <Text
              style={{
                padding: "1rem 2rem",
                background: "#40507a",
                color: "white",
                width: "fit-content",
              }}
            >
              {otp}
            </Text>
            <p>
              This OTP is valid for a limited time only. Please do not share it
              with anyone.
            </p>
            <p>Thank you for choosing our service!</p>
          </Section>

          <Section>
            <Text>
              If you encounter any issues or have any questions, please feel
              free to reach out to our support team at
              <Button
                href="mailto:support@hagerignaequb.com"
                style={{ color: "#01890d" }}
              >
                support@hagerignaequb.com
              </Button>
              .
            </Text>
          </Section>
        </Container>
      </Html>
    </>
  );
};

export default OTPVerify;
