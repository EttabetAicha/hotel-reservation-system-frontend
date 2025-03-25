import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { Reservation, ReservationStatus } from '../models/reservation.interface';

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  private apiUrl = 'http://localhost:8080/api/reservations';
  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {}


  createReservation(reservation: Reservation): Observable<Reservation> {
    return this.http.post<Reservation>(this.apiUrl, reservation).pipe(
      catchError((error) => {
        console.error('Error creating reservation:', error);

        if (error.status === 400) {
          console.error('Bad Request:', error.error);
        } else if (error.status === 401) {
          console.error('Unauthorized access:', error.message);
        } else if (error.status === 404) {
          console.error('API endpoint not found:', error.url);
        } else if (error.status === 500) {
          console.error('Internal Server Error:', error.message);
        } else {
          console.error('Unexpected error:', error);
        }

        return throwError(() => new Error('Failed to create reservation. Please try again later.'));
      })
    );
  }


  getReservationById(id: string): Observable<Reservation> {
    return this.http.get<Reservation>(`${this.apiUrl}/${id}`);
  }

  getAllReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(this.apiUrl);
  }

  updateReservation(id: string, reservation: Reservation): Observable<Reservation> {
    return this.http.put<Reservation>(`${this.apiUrl}/${id}`, reservation);
  }

  deleteReservation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getReservationsByClientId(clientId: string): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/client/${clientId}`);
  }

  getReservationsByHotelId(hotelId: string): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/hotel/${hotelId}`);
  }

  getReservationsByStatus(status: ReservationStatus): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/status/${status}`);
  }

  getReservationsByCheckInDateBetween(startDate: string, endDate: string): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/checkin`, {
      params: { startDate, endDate },
    });
  }

  getReservationsByRoomId(roomId: string): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/room/${roomId}`);
  }
  getRoomNameById(roomId: string): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/room/${roomId}/name`, {
      responseType: 'text' as 'json'
    }).pipe(
      catchError((error) => {
        console.error(`Error fetching room name for room ${roomId}:`, error);
        return of('Unknown Room');
      })
    );
  }

  getHotelNameByRoomId(roomId: string): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/room/${roomId}/hotel-name`, {
      responseType: 'text' as 'json'
    }).pipe(
      catchError((error) => {
        console.error(`Error fetching hotel name for room ${roomId}:`, error);
        return of('Unknown Hotel');
      })
    );
  }

  getHotelImagesByRoomId(roomId: string): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/room/${roomId}/hotel-images`, {
      responseType: 'text' as 'json'
    }).pipe(
      catchError((error) => {
        console.error(`Error fetching hotel image for room ${roomId}:`, error);
        return of('assets/default-hotel.jpg');
      })
    );
  }
}