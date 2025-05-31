type ApprovalSms = (fullName:string,remainingDay:number) => string;


export const ApprovalSms:ApprovalSms = (fullName,remainingDay)=>{
    return `ጤና ይስጥልኝ ${fullName}፣ የ‹‹ደላላዬ ›› መተግበሪያ ተጠቃሚ በመሆኖ እናመሰግናለን።
አሁን ያሎት ቀሪ ቀን ${remainingDay} ነው።
ለተጨማሪ መረጃ 9416 ይደውሉ
መደለል ከመታመን ይጀምራል።
    `
}