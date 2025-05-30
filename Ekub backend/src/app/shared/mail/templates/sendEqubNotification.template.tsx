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
import { EqubNotificationProps } from "../interfaces/mail.interface";

// Props interface to type-check the data passed into the template

const EqubNotification: React.FC<EqubNotificationProps> = ({
  equbName,
  time,
}) => {
  return (
    <>
      <Html>
        <Container>
          <Section>
            <Heading as="h1" style={{ color: "#40507a", fontWeight: "bolder" }}>
              Winner Announcement for "{equbName}" Coming Soon!
            </Heading>
            <Hr />
            <Text>Dear Member,</Text>
            <Hr />
            <Text>
              We want to inform you that the winner for the Equb "
              <strong>{equbName}</strong>" will be announced soon. The
              announcement will take place at <strong>{time}</strong>.
            </Text>
            <Hr />
            <Text>Stay tuned and be ready for the announcement!</Text>
          </Section>

          <Section>
            <Text>
              If you have any questions or need assistance, feel free to contact
              us at{" "}
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

export default EqubNotification;
