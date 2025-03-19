import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RoomService } from "../../../core/services/room.service";
import { HotelService } from "../../../core/services/hotel.service";
import { RoomModalComponent } from "./room-modal.component";
import { HotelFormData } from "../../../core/models/hotel.interface";
import { RoomFormData, RoomStatus, RoomType } from "../../../core/models/room.interface";
import Swal from "sweetalert2";
import { HttpErrorResponse } from "@angular/common/http";

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
  filterHotel: number = 0;

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
      console.log('Hotels fetched:', this.hotels);
      this.fetchRooms();
    });
  }

  fetchRooms(): void {
    this.roomService.getAllRoomDatas().subscribe((rooms) => {
      this.rooms = rooms;
      this.filterRooms();
    });
  }

  filterRooms(): void {
    let filtered = [...this.rooms];

    if (this.filterHotel !== 0) {
      filtered = filtered.filter(room => room.hotel === this.filterHotel.toString());
    }

    if (this.searchTerm && this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(room =>
        room.name.toLowerCase().includes(term) ||
        room.roomNumber.toString().toLowerCase().includes(term) ||
        this.convertToLowercase(room.type)
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


  openAddRoomModal(): void {
    this.roomModalEditMode = false;
    this.roomToEdit = null;
    this.showRoomModal = true;
  }

  editRoom(room: RoomFormData): void {
    console.log('Room passed to editRoom:', room);

    this.roomService.getRoomDataById(room.id!).subscribe({
      next: (fullRoomData) => {
        this.roomModalEditMode = true;

        this.roomToEdit = {
          ...fullRoomData
        };

        console.log('roomToEdit passed to modal:', this.roomToEdit);
        this.showRoomModal = true;
      },
      error: (error) => {
        console.error('Error fetching room details for edit:', error);
        Swal.fire({
          title: 'Error',
          text: 'Failed to load room details for editing.',
          icon: 'error',
          confirmButtonColor: '#4f46e5'
        });
      }
    });
  }
  closeRoomModal(): void {
    this.showRoomModal = false;
  }

  saveRoom(roomData: RoomFormData): void {
    if (this.roomModalEditMode && this.roomToEdit) {
      this.roomService.updateRoomData(roomData.id!, roomData).subscribe({
        next: (updatedRoom) => {
          const index = this.rooms.findIndex(r => r.id === this.roomToEdit!.id);
          if (index !== -1) {
            this.rooms[index] = { ...this.rooms[index], ...updatedRoom };
          }
          this.filterRooms();
          this.closeRoomModal();
        },
        error: (error) => {
          console.error('Update Room Error:', error);
        }
      });
    } else {
      if (!roomData.hotel) {
        console.error('Create Room Error: Missing hotel ID.');
        return;
      }

      this.roomService.createRoomData(roomData, roomData.hotel).subscribe({
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
  convertToLowercase(value: string | RoomType | RoomStatus): string {
    return value.toString().toLowerCase();
  }

  viewRoomDetails(roomId: string): void {
    this.roomService.getRoomDataById(roomId).subscribe({
      next: (room) => {
        console.log(room)
        Swal.fire({
          title: '<div class="flex items-center justify-center text-lg font-bold text-gray-800 border-b border-gray-200 w-full pb-3"><svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>Room Details</div>',
          html: `
            <div class="text-left p-4 bg-gray-50 rounded-lg">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
                <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <p class="mb-3 flex items-center">
                    <svg class="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span class="font-semibold text-gray-700 text-sm">Name:</span>
                    <span class="ml-2 text-sm">${room.name}</span>
                  </p>
                  <p class="mb-3 flex items-center">
                    <svg class="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                    <span class="font-semibold text-gray-700 text-sm">Hotel:</span>
                    <span class="ml-2 text-sm">${room.hotelName}</span>
                  </p>
                  <p class="mb-3 flex items-center">
                    <svg class="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path></svg>
                    <span class="font-semibold text-gray-700 text-sm">Room Number:</span>
                    <span class="ml-2 text-sm">${room.roomNumber}</span>
                  </p>
                  <p class="mb-3 flex items-center">
                    <svg class="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                    <span class="font-semibold text-gray-700 text-sm">Type:</span>
                    <span class="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">${this.convertToLowercase(room.type)}</span>
                  </p>
                </div>
                <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <p class="mb-3 flex items-center">
                    <svg class="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span class="font-semibold text-gray-700 text-sm">Price:</span>
                    <span class="ml-2 text-green-600 font-medium text-sm">$${room.price}</span>
                  </p>
                  <p class="mb-3 flex items-center">
                    <svg class="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span class="font-semibold text-gray-700 text-sm">Status:</span>
                    <span class="ml-2 px-2.5 py-1 rounded-full text-xs font-medium ${this.getStatusBadgeClass(room.status)} flex items-center">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        ${this.convertToLowercase(room.status) === 'available' ?
                          '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>' :
                          this.convertToLowercase(room.status) === 'occupied' ?
                          '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>' :
                          '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>'}
                      </svg>
                      ${this.convertToLowercase(room.status)}
                    </span>
                  </p>
                  <p class="mb-3 flex items-start">
                    <svg class="w-4 h-4 mr-2 mt-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    <span class="font-semibold text-gray-700 text-sm">Description:</span>
                    <span class="ml-2 text-sm text-gray-600">${room.description || 'No description available'}</span>
                  </p>
                </div>
              </div>
              <div class="mt-4 rounded-lg overflow-hidden shadow-md border border-gray-200">
                <div class="relative pb-[56.25%] h-0">
                  <img src="${room.imageUrl}" alt="Room Image" class="absolute h-full w-full object-cover"/>
                </div>
              </div>
            </div>
          `,
          showCloseButton: true,
          focusConfirm: false,
          confirmButtonText: '<div class="flex items-center"><svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>Close</div>',
          customClass: {
            popup: 'bg-white shadow-xl rounded-lg w-[600px] mx-auto',
            title: 'mb-0 pb-0',
            htmlContainer: 'text-gray-700 p-0 overflow-hidden',
            confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center'
          },
          buttonsStyling: false
        });
      },
      error: (error: HttpErrorResponse) => {
        console.error('View Room Details Error:', error);
        Swal.fire({
          title: '<div class="flex items-center text-red-600"><svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>Error</div>',
          text: 'An error occurred while fetching the room details.',
          icon: 'error',
          customClass: {
            popup: 'bg-white shadow-xl rounded-lg',
            title: 'text-red-600',
            confirmButton: 'bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200'
          },
          buttonsStyling: false
        });
      }
    });
  }

  getHotelNameById(hotelId: number): string {
    const hotel = this.hotels.find(h => h.id === hotelId.toString());
    return hotel ? hotel.name : 'Unknown Hotel';
  }
}