
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
import {StaffWelcomeProps} from '../interfaces/mail.interface'

const StaffWelcome:React.FC<StaffWelcomeProps> = ({fullName,password}) => {
  return (
 <>
 <Html>
    <Container>
      <Section>
      <Heading as='h1' style={{color:'#40507a',fontWeight:'bolder'}}>Welcome to Hagerigna Equb!</Heading>
<Hr></Hr>
      <Text> Hey {fullName}.</Text>
<Hr></Hr>
  <Text>Here is your password for your newly created staff account.</Text>
<Hr></Hr>
 <Text style={{padding:'1rem 2rem',background:'#40507a',color:'white',width:'fit-content'}}>{password}</Text>
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

export default StaffWelcome
