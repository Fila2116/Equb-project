"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovalSms = void 0;
const ApprovalSms = (fullName, remainingDay) => {
    return `ጤና ይስጥልኝ ${fullName}፣ የ‹‹ደላላዬ ›› መተግበሪያ ተጠቃሚ በመሆኖ እናመሰግናለን።
አሁን ያሎት ቀሪ ቀን ${remainingDay} ነው።
ለተጨማሪ መረጃ 9416 ይደውሉ
መደለል ከመታመን ይጀምራል።
    `;
};
exports.ApprovalSms = ApprovalSms;
