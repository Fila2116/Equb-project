import { Equb, EquberUser } from "@prisma/client";
import prisma from "../../../../config/db.config";

export async function updateEquberUserPaymentScore(equberUserId: string, equbId: string, paidAt: Date) {
    try {
console.log('got on payment score update function.');

        const equberUser = await prisma.equberUser.findUnique({where:{id:equberUserId}})
        console.log('equberUser');
        console.log(equberUser);
        if(!equberUser) throw new Error('equberUser not found')
        
        const equb = await prisma.equb.findUnique({where:{id:equbId},include:{equbType:true}})
        console.log('equb');
        console.log(equb);
        if(!equb) throw new Error('equb not found')
        const {equbType:{interval},currentRound,equbAmount,startDate} = equb;
        const {totalPaid,paymentScoreCalculatedRound} = equberUser;
        const expectedPaidAmount = currentRound*equbAmount;
        if(totalPaid>= expectedPaidAmount){
            const equbStartDate = new Date(startDate!)
            
      
        let scoreAdjustment = 0;
      for(let i=paymentScoreCalculatedRound; i<currentRound; i++){
        const dueDate  = addDays(equbStartDate,interval*i);
            console.log('dueDate');
            console.log(dueDate);
    
            const daysLate = Math.ceil((paidAt.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      console.log('daysLate');
      console.log(daysLate);
        if (daysLate <= 0) {
            scoreAdjustment =scoreAdjustment+ 10; // Early or on-time payment
          } else if (daysLate <= 2) {
            scoreAdjustment =scoreAdjustment - 5;  // Slightly late
          } else {
            scoreAdjustment = scoreAdjustment - 10; // Very late
          }
      }
       
      
        await prisma.equberUser.update({
          where: { id: equberUserId },
          data: {
            paymentScore: {
              increment: scoreAdjustment,
            },
            paymentScoreCalculatedRound:currentRound
          },
        });
        }
       
    } catch (error) {
        console.log(`Error on updating equber user payment score`);
        
    }

  }

  async function updateUserScore(userId: number, dueDate: Date, paidAt: Date, extraDays: number) {
    // Add extra days to the due date
    const adjustedDueDate = addDays(dueDate, extraDays); // This will be a Date object
  
    // Calculate the difference in days (adjustedDueDate and paidAt are both Date objects)
    const daysLate = Math.ceil((paidAt.getTime() - adjustedDueDate.getTime()) / (1000 * 60 * 60 * 24));
  
    let scoreAdjustment = 0;
  
    // Apply scoring logic based on the modified due date
    if (daysLate <= 0) {
      scoreAdjustment = 10; // Early or on-time payment
    } else if (daysLate <= 7) {
      scoreAdjustment = -5;  // Slightly late
    } else {
      scoreAdjustment = -10; // Very late
    }
  
  }

  function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }