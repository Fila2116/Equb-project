import schedule from 'node-schedule'
import prisma from '../config/db.config';
import { getEligibleEqubers } from '../controllers/admin/equb/helper/get-eligible-equbers.helper';
import SMSService from '../shared/sms/services/sms.service';


// Function to be executed by the scheduler
async function notifyAdminForDueBanner() {
  try {
    console.log('Fetching due banners...');
const notificatioinSetting = await prisma.setting.findFirst({where:{name:'notificationTime',state:'active'}});
const notificationTime = notificatioinSetting?.numericValue || 30
    const now = new Date();
    const dueDateTime = new Date(now.getTime() +notificationTime *  60 * 1000);
    const dueBanners = await prisma.banner.findMany({
      where:{
        validUntil: {
          lt: dueDateTime,
        },
      }
    })
    
    const superAdmins = await prisma.staff.findMany({
        where:{
          role: {
            name: 'Super Admin'
          }  
        }
    })
   console.log('superAdmins')
    console.log(superAdmins)
    for (const banner of dueBanners) {
for(const admin of superAdmins){
    await SMSService.sendSms(admin.phoneNumber,`Banner ${banner.name} will end from tommorow on`)

}
       
      }
    
   
  } catch (error) {
    console.error('Error drawing lottery:', error);
    
  }
}



// Schedule a task to run every minute
const job = schedule.scheduleJob('* * * * *', notifyAdminForDueBanner);

module.exports = job;