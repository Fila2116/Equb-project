export const calculatePaidAmount = (
  totalPaid: number,
  round: number,
  equbAmount: number
): number => {
  const expectedAmount = round * equbAmount;
  console.log("expectedAmount");
  console.log(expectedAmount);
  console.log("totalPaid");
  console.log(totalPaid);

  const paidAmount = Math.floor(expectedAmount) - totalPaid;
  if (paidAmount <= 0) {
    return equbAmount;
  } else {
    return equbAmount - paidAmount;
  }
};

export const calculatePaidRound = (
  userEqubAmount: number,
  totalPaid: number
): number => {
  return Math.floor(totalPaid / userEqubAmount);
};
