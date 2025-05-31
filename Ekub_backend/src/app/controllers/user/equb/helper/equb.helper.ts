import { Equb } from "@prisma/client";

export const formattedEqubs = (equbs: Equb[]) => {
  return equbs.map((equb) => {
    if (equb.nextRoundDate) {
    }
    return equb;
  });
};
