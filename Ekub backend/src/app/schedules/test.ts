import schedule from 'node-schedule'
import prisma from '../config/db.config';
import { getEligibleEqubers } from '../controllers/admin/equb/helper/get-eligible-equbers.helper';


// Function to be executed by the scheduler
async function drawLottery() {
  try {
    console.log('Fetching Upcoming equbs...');

    const now = new Date();
  const aMinuteFromNow = new Date(now.getTime() +1 *  60 * 1000);
    const pastEqubs = await prisma.equb.findMany({
      where:{
        nextRoundDate: {
          lt: aMinuteFromNow,
        },
      },
      include:{
        equbType:true,
        equbers: {
          include:{users:{
            include:{user:true}
          }}
        }
      }
    })
    // console.log('pastEqubs')
    // console.log(pastEqubs)
    if(pastEqubs.length > 0) {

        for (const equb of pastEqubs) {

            const now = new Date();
const aMinuteAgo = new Date(now.getTime() + 60 * 1000);
if(equb.nextRoundDate! < aMinuteAgo){
    console.log(`Yederese equb for ${equb.name} `);
    console.log(`Date : ${equb.nextRoundDate} `);

}
            
            
        }
    }else{
    console.log('Yederese equb yelem')

    }
    
   
  } catch (error) {
    console.error('Error drawing lottery:', error);
    
  } 
}

drawLottery()
