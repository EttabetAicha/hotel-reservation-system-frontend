import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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

  getRoomDataById(id: string): Observable<RoomFormData> {
    return this.http.get<RoomFormData>(`${this.apiUrl}/${id}`);
  }

  createRoomData(roomData: RoomFormData): Observable<RoomFormData> {
    return this.http.post<RoomFormData>(`${this.apiUrl}/${roomData.hotel}`, roomData); // Include hotelId in the URL
  }

  updateRoomData(id: string, roomData: RoomFormData): Observable<RoomFormData> {
    return this.http.put<RoomFormData>(`${this.apiUrl}/${id}`, roomData);
  }

  deleteRoomData(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
