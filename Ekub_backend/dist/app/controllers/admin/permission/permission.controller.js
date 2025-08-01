"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPermissions = void 0;
const error_config_1 = require("../../../config/error.config");
const client_1 = require("@prisma/client");
exports.getPermissions = (0, error_config_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const permissions = Object.values(client_1.Permissions);
    res.status(200).json({
        status: "success",
        data: {
            permissions,
        },
    });
}));
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
