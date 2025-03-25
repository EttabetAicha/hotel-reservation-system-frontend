import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Payment } from '../models/payment.interface';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private apiUrl = 'http://localhost:8080/api/payments';

  constructor(private http: HttpClient) {}

  createPayment(payment: Payment): Observable<Payment> {
    return this.http.post<Payment>(this.apiUrl, payment);
  }
  getPaymentById(id: string): Observable<Payment> {
    return this.http.get<Payment>(`${this.apiUrl}/${id}`);
  }
  getAllPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(this.apiUrl);
  }
  updatePayment(id: string, payment: Payment): Observable<Payment> {
    return this.http.put<Payment>(`${this.apiUrl}/${id}`, payment);
  }
  deletePayment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  confirmPayment(stripePaymentIntentId: string): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/confirm/${stripePaymentIntentId}`, {});
  }
  processPayment(id: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.apiUrl}/${id}/process`, {});
  }
  cancelPayment(paymentIntentId: string): Observable<{ status: string; message: string }> {
    return this.http.post<{ status: string; message: string }>(`${this.apiUrl}/cancel/${paymentIntentId}`, {});
  }
  getPaymentsByReservationId(reservationId: string): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/reservation/${reservationId}`);
  }
  createPaymentIntent(amount: number): Observable<{ paymentIntentId: string }> {
    return this.http.post<{ paymentIntentId: string }>(`${this.apiUrl}/create-payment-intent`, null, {
      params: { amount: amount.toString() },
    });
}
  getPaymentsByStatus(status: string): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/status/${status}`);
  }
}