import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../../config/error.config";
import { Permissions } from "@prisma/client";


export const getPermissions = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const permissions = Object.values(Permissions)

    res.status(200).json({
      status: "success",
      data: {
        permissions,
      },
    });
  }
);
// export const updatePemission = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
    
//     const branch = await prisma.branch.create({
//         data:{
//             name:name,
//             city:city,
//             phoneNumber:phoneNumber?phoneNumber:''
//         }
//     })
//     await prisma.activity.create({
//       data:{
//        action:Permissions.branch,
//        staffId:req.staff?.id!,
//        branchId:branch.id,
//        description:`${req.staff?.fullName} created a new branch - ${branch.name}.`
//       }
//    })
//     res.status(200).json({
//       status: "success",
//       data: {
//         branch,
//       },
//     });
//   }
// );


