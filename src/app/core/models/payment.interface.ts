import { Reservation } from './reservation.interface';

export interface Payment {
  id?: string;
  reservationId?: string;
  amount: number;
  paymentMethod: string;
  stripePaymentIntentId?: string;
  paymentStatus: PaymentStatus;
  payerName: string;
  payerEmail: string;
  billingAddress: string;
  billingCity: string;
  billingState: string;
  billingZip: string;
  billingCountry: string;
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}