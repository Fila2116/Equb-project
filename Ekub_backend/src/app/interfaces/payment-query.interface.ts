import { QueryInterface } from "../shared/interfaces/query.interface";

export interface GetPaymentsQueryInterface extends QueryInterface {
  state: string;
  paymentMethod: string;
  approved: string;
  equb: string;
  sortBy: "newest" | "oldest";
  startDate: string;
  endDate: string;
  companyBankId: string;
  equbId: string;
}
