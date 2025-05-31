import { QueryInterface } from "../shared/interfaces/query.interface";

export interface GetEqubsQueryInterface extends QueryInterface {
  branch: string;
  user: string;
  equbType: string;
  equbCategory: string;
  status: "joined" | "pending";
  sortBy: "newest" | "oldest";
  lotteryNumber?: string;
}

export interface GetClaimQueryInterface extends QueryInterface {
  user: string;
  equb: string;
}


export interface GetMyEqubPaymentsQueryInterface extends QueryInterface {
  approved: "true" | "false";
}
