import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HotelFormData } from '../../features/admin/hotels/hotel-modal.component';

@Injectable({
  providedIn: 'root'
})
export class HotelService {
  private apiUrl = 'http://localhost:8080/api/hotels';

  constructor(private http: HttpClient) {}

  getAllHotels(): Observable<HotelFormData[]> {
    return this.http.get<HotelFormData[]>(this.apiUrl);
  }

  getHotelById(id: string): Observable<HotelFormData> {
    return this.http.get<HotelFormData>(`${this.apiUrl}/${id}`);
  }

  createHotel(hotel: HotelFormData): Observable<HotelFormData> {
    return this.http.post<HotelFormData>(this.apiUrl, hotel);
  }

  updateHotel(id: string, hotel: HotelFormData): Observable<HotelFormData> {
    return this.http.put<HotelFormData>(`${this.apiUrl}/${id}`, hotel);
  }

  deleteHotel(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
