import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { RoomFormData } from '../models/room.interface';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private apiUrl = 'http://localhost:8080/api/rooms';

  constructor(private http: HttpClient) { }

  getAllRoomDatas(): Observable<RoomFormData[]> {
    return this.http.get<RoomFormData[]>(this.apiUrl);
  }
getRoomDataById(id: string) {
  return this.http.get<RoomFormData>(`${this.apiUrl}/${id}`).pipe(
    tap(room => {
      console.log('Fetched room data:', room);
    })
  );
}

  getRoomDataByHotelId(hotelId: string): Observable<RoomFormData> {
    return this.http.get<RoomFormData>(`${this.apiUrl}/hotel/${hotelId}`);
  }

  createRoomData(roomData: RoomFormData, hotelId: string): Observable<RoomFormData> {
    return this.http.post<RoomFormData>(`${this.apiUrl}/${hotelId}`, roomData);
  }

  updateRoomData(id: string, roomData: RoomFormData): Observable<RoomFormData> {
    return this.http.put<RoomFormData>(`${this.apiUrl}/${id}`, roomData);
  }

  deleteRoomData(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
