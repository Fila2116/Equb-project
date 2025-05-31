import { NextFunction, Request, Response } from "express";
import prisma from "../../../config/db.config";
import { catchAsync } from "../../../config/error.config";




const createDeviceToken = catchAsync(async (req: Request, res: Response,next:NextFunction) => {
    
      console.log(req.user)
      let token = await prisma.deviceToken.create({data:{
        token:req.body.token,
        user:{
            connect:{id:req.user?.id}
        }    
    }})
      res.json({ token });
   
  });
  
 
  
export default { createDeviceToken };
