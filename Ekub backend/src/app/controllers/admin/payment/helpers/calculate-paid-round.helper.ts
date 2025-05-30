export const calculatePaidRounds  = (totalPaid:number, equbAmount:number):number=>{
console.log(   `totalPaid: ${totalPaid}`)
console.log(   `equbAmount: ${equbAmount}`)
    return Math.floor(totalPaid/equbAmount)

}