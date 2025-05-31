import { NotificationType } from "../enums/notification-type.enum";

export interface IPayload {
  type?: NotificationType;
  payload: string;
}
