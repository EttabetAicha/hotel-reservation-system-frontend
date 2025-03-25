import { Payment } from "./payment.interface";

export interface Reservation {
  id?: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  clientId: string;
  totalPrice: number;
  status: ReservationStatus;
  createdAt?: Date;
  payment: Payment;
}

export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}
