import crypto from 'crypto'
import prisma from '../../../config/db.config';

// export const  createPasswordResetToken = async (email: string)=> {
//     const token = crypto.randomBytes(32).toString("hex");
//     const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

//     const date = new Date();
//     date.setDate(date.getDate() + 1);
//     await prisma.user.update({
//         where:{email:email},
//         data:{
//             passwordResetToken: hashedToken,
//             passwordResetExpiresIn: date
//         }
//     });
//     return token;
//   }

  