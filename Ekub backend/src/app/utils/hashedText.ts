import bcrypt from 'bcryptjs'

export const hashedString = async  (text: string) =>{
    const salt = await bcrypt.genSalt(10);
    const   hashedText =  await bcrypt.hash(text, salt);
    return hashedText ;
}