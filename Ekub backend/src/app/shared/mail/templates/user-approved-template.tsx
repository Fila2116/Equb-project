
import React from 'react'
import { Row } from '@react-email/row';
import { Column } from '@react-email/column';
import { Html } from '@react-email/html';
import { Heading } from '@react-email/heading';
import { Button } from '@react-email/button';
import { Container } from '@react-email/container';
import { Section } from '@react-email/section';
import { Text } from '@react-email/text';
import { Hr} from "@react-email/hr";
import {ApprovalEmailProps} from '../interfaces/mail.interface'

const ApprovalEmail:React.FC<ApprovalEmailProps> = ({fullName}) => {
  return (
 <>
 <Html>
    <Container>
      <Section>
      <Text>Welcome {fullName}, Thank you for registering!</Text>
<Hr></Hr>
      <Text> Your account on hagerigna app is aproved.</Text>
<Hr></Hr>
  
 
      </Section>

 
     <Section>
     <Text>If you encounter any issues or have any questions, please feel free to reach out to our support team at  <Button  href="mailto:support@hagerignaequb.com" style={{ color: "#01890d" }}>
    support@hagerignaequb.com
  </Button>.</Text>
    </Section>
 
    </Container>
</Html>
 </>
   
  );
};

export default ApprovalEmail
