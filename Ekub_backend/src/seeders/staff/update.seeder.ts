import prisma from "../../app/config/db.config";
import { hashedString } from "../../app/utils/hashedText";
async function updateStaffs(){
    try {
        
    
   
    const   hashedPassword =  await hashedString('123456')
    await prisma.staff.updateMany({
        data:{
            password:hashedPassword
        }
    })
} catch (error) {
    console.log('Error updating staffs')
    console.log(error)  
    }
}

updateStaffs().then(()=>{
    console.log('Staff seed finished successfully.')
})