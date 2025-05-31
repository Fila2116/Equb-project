import { NextFunction, Request, Response } from "express";

import { QueryInterface } from "../../../shared/interfaces/query.interface";
import prisma from "../../../config/db.config";
import { catchAsync } from "../../../config/error.config";
import AppError from "../../../shared/errors/app.error";
import { DESTINANTIONS, FILTERS, multerConfig, RESOURCES } from "../../../config/multer.config";



const upload = multerConfig(
  RESOURCES.AVATAR,
  DESTINANTIONS.IMAGE.AVATAR,
  FILTERS.IMAGE
);

/**
* Upload Middleware
*/
export const uploadImage = {
  pre: upload.single("picture"),
  post: (req: Request, _: Response, next: NextFunction) => {
      console.log('req.file')
      console.log(req.file)
    if (req.file) {
      req.body.picture = req.file.filename;
    }
    next();
  },
};

export const getMyProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    
   const user = await prisma.user.findUnique({where:{id:req.user?.id},include:{
    bankAccounts:true
   }})
   if(user?.firstName && user?.lastName && user?.email && user?.bankAccounts.length>0 && user.kycId){
    user.profileCompletion =100
   }

    res.status(200).json({
      status: "success",
      data: {
        user
      },
    });
  }
);


export const getUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await prisma.user.findUnique({
      where: {
        id: req.params.id,
      },
      include:{kyc:true}
    });

    if (!user) {
      return next(
        new AppError(`User with ID ${req.params.id} does not exist`, 400)
      );
    }

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  }
);

export const updateProfilePic =  catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {fileName} = req.body;
const updatedData:any = {
  
}
if (fileName) updatedData.avatar = fileName;
    

    const user = await prisma.user.update({
     where:{id:req.params.id},
     data:updatedData
   })

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  }
);
export const updatePersonalInfo = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {firstName,lastName,grandFatherName,phoneNumber,username,email,gender,fileName} = req.body;
    const updatedData:any = {
       firstName,
       lastName,
       fullName: `${firstName} ${lastName}`,
       phoneNumber
    }
    if(username) updatedData.username= username;
    if(email) updatedData.email= email;
    if(fileName) updatedData.avatar= fileName;
    if(grandFatherName) updatedData.grandFatherName=grandFatherName;
    const userKyc = await prisma.kyc.create({
      data:{
        firstName:firstName,
        fatherName:lastName,
        grandFatherName:grandFatherName?grandFatherName:'',
        gender:gender?gender:null
    
      }
    })
    updatedData.kycId= userKyc.id;
    updatedData.profileCompletion=75;
    const user = await prisma.user.update({where:{id:req.params.id},data:updatedData,include:{kyc:true}});

    if (!user) {
      return next(
        new AppError(`User with ID ${req.params.id} does not exist`, 400)
      );
    }

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  }
);

export const getMyBankAccounts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user?.id,
      },
      include:{bankAccounts:{
        include:{bank:true}
      }}
    });

    

    res.status(200).json({
      status: "success",
      data: {
        bankAccounts:user?.bankAccounts,
      },
    });
  }
);

export const addBankAccount = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const {bankId,accountName,accountNumber} = req.body;
     const bank = await prisma.bank.findUnique({where:{id:bankId}})
      
     if (!bank) {
        return next(
          new AppError(`Bank with ID ${bankId} does not exist`, 400)
        );
      }
      console.log('req.user')
      console.log(req.user)
 const bankAccount= await    prisma.bankAccount.create({
          //@ts-ignore
        data:{
            accountName:accountName,
            accountNumber:accountNumber,
            userId:req.user?.id,
            bankId:bankId,
        },
        include:{bank:true}
      })
      const user = await prisma.user.update({where:{id:req.params.id},data:{profileCompletion:100},include:{kyc:true}});
  
      
  
      res.status(200).json({
        status: "success",
        data: {
          bankAccount,
        },
      });
    }
  );

export const updateBankAccount = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const {accountName,accountNumber} = req.body;
      
    const bankAccount= await prisma.bankAccount.update({
        where:{id:req.params.id},
        data:{
            accountName:accountName,
            accountNumber:accountNumber
        },
        include:{bank:true}
      })
      if (!bankAccount) {
        return next(
          new AppError(`Bank account with ID ${req.params.id} does not exist`, 400)
        );
      }
  
      res.status(200).json({
        status: "success",
        data: {
          bankAccount,
        },
      });
    }
  );