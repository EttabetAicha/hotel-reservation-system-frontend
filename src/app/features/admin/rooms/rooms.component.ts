import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RoomService } from "../../../core/services/room.service";
import { HotelService } from "../../../core/services/hotel.service";
import { RoomModalComponent } from "./room-modal.component";
import { HotelFormData } from "../../../core/models/hotel.interface";
import { RoomFormData, RoomStatus } from "../../../core/models/room.interface";

@Component({
  selector: "app-admin-rooms",
  standalone: true,
  imports: [CommonModule, FormsModule, RoomModalComponent],
  templateUrl: "./rooms.component.html",
})
export class AdminRoomsComponent implements OnInit {
  rooms: RoomFormData[] = [];
  filteredRooms: RoomFormData[] = [];
  hotels: HotelFormData[] = [];
  searchTerm = '';
  filterHotel = '';

  showRoomModal = false;
  roomModalEditMode = false;
  roomToEdit: RoomFormData | null = null;

  showDeleteModal = false;
  roomToDelete: RoomFormData | null = null;
  isDeleting = false;

  constructor(private roomService: RoomService, private hotelService: HotelService) {}

  ngOnInit(): void {
    this.fetchHotels();
  }

  fetchHotels(): void {
    this.hotelService.getAllHotels().subscribe((hotels) => {
      this.hotels = hotels;
      this.fetchRooms();
    });
  }

  fetchRooms(): void {
    this.roomService.getAllRoomDatas().subscribe((rooms) => {
      this.rooms = rooms;
      this.filterRooms();
    });
  }
  getHotelName(hotelId: string): string {
    const hotel = this.hotels.find(h => h.id === Number(hotelId));
    return hotel ? hotel.name : 'Unknown Hotel';
  }
  filterRooms(): void {
    let filtered = [...this.rooms];

    // Apply hotel filter
    if (this.filterHotel !== '') {
      filtered = filtered.filter(room => room.hotel === this.filterHotel);
    }

    // Apply search term filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(room =>
        room.name.toLowerCase().includes(term) ||
        room.type.toString().toLowerCase().includes(term)
      );
    }

    this.filteredRooms = filtered;
  }

   getStatusBadgeClass(status: RoomStatus): string {
      switch (status) {
        case RoomStatus.AVAILABLE:
          return 'bg-green-100 text-green-800';
        case RoomStatus.OCCUPIED:
          return 'bg-red-100 text-red-800';
        case RoomStatus.MAINTENANCE:
          return 'bg-yellow-100 text-yellow-800';
        case RoomStatus.RESERVED:
          return 'bg-blue-100 text-blue-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }

  // Room Modal Methods
  openAddRoomModal(): void {
    this.roomModalEditMode = false;
    this.roomToEdit = null;
    this.showRoomModal = true;
  }

  editRoom(room: RoomFormData): void {
    this.roomModalEditMode = true;
    this.roomToEdit = { ...room };
    this.showRoomModal = true;
  }

  closeRoomModal(): void {
    this.showRoomModal = false;
  }

  saveRoom(roomData: RoomFormData): void {
    if (this.roomModalEditMode && this.roomToEdit) {
      // Update existing room
      this.roomService.updateRoomData(roomData.id!, roomData).subscribe({
        next: (updatedRoom) => {
          const index = this.rooms.findIndex(r => r.id === this.roomToEdit!.id);
          if (index !== -1) {
            this.rooms[index] = {
              ...this.rooms[index],
              ...updatedRoom
            };
          }
          this.filterRooms();
          this.closeRoomModal();
        },
        error: (error) => {
          console.error('Update Room Error:', error);
        }
      });
    } else {
      // Add new room
      this.roomService.createRoomData(roomData).subscribe({
        next: (newRoom) => {
          this.rooms.unshift(newRoom);
          this.filterRooms();
          this.closeRoomModal();
        },
        error: (error) => {
          console.error('Create Room Error:', error);
        }
      });
    }
  }

  // Delete Modal Methods
  openDeleteModal(room: RoomFormData): void {
    this.roomToDelete = room;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (!this.roomToDelete) return;

    this.isDeleting = true;

    this.roomService.deleteRoomData(this.roomToDelete.id!).subscribe({
      next: () => {
        this.rooms = this.rooms.filter(r => r.id !== this.roomToDelete!.id);
        this.filterRooms();
        this.isDeleting = false;
        this.showDeleteModal = false;
        this.roomToDelete = null;
      },
      error: (error) => {
        console.error('Delete Room Error:', error);
        this.isDeleting = false;
      }
    });
  }

  viewRoomDetails(id: string): void {
    // Implementation for viewing room details
    console.log('View room details', id);
  }
}
