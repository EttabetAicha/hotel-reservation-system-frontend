import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RoomFormData, RoomStatus, RoomType } from "../../../core/models/room.interface";
import { Hotel, HotelFormData } from "../../../core/models/hotel.interface";
import { RoomService } from "../../../core/services/room.service";
import { HttpErrorResponse } from "@angular/common/http";

@Component({
  selector: "app-room-modal",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./room-modal.component.html",
  styles: [`
    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class RoomModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() editMode = false;
  @Input() roomToEdit: RoomFormData | null = null;
  @Input() hotels: HotelFormData[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<RoomFormData>();

  roomData: RoomFormData = this.getEmptyRoomData();
  isSaving = false;
  errors: Record<string, string> = {};

  constructor(private roomService: RoomService) {}

  ngOnInit(): void {
    this.resetForm();
  }

  ngOnChanges(): void {
    if (this.isOpen) {
      if (this.editMode && this.roomToEdit) {
        this.roomData = { ...this.roomToEdit };
      } else {
        this.resetForm();
      }
    }
  }

  resetForm(): void {
    this.roomData = this.getEmptyRoomData();
    this.errors = {};
  }

  getEmptyRoomData(): RoomFormData {
    return {
      name: '',
      hotel: '',
      roomNumber: '',
      type: RoomType.SINGLE,
      price: 100,
      isAvailable: true,
      description: '',
      imageUrl: '',
      status: RoomStatus.AVAILABLE
    }
  }

  saveRoom(): void {
    if (this.validateForm()) {
      this.isSaving = true;

      const payload = {
        ...this.roomData,
        hotel: this.roomData.hotel
      };

      console.log('Payload:', payload);

      if (this.editMode && this.roomData.id) {
        this.roomService.updateRoomData(this.roomData.id, payload).subscribe({
          next: (response) => {
            this.isSaving = false;
            this.save.emit(response);
            this.closeModal();
          },
          error: (error: HttpErrorResponse) => {
            this.isSaving = false;
            this.errors['general'] = 'An error occurred while updating the room.';
            console.error('Update Room Error:', error);
          }
        });
      } else {
        this.roomService.createRoomData(payload).subscribe({
          next: (response) => {
            this.isSaving = false;
            this.save.emit(response);
            this.closeModal();
          },
          error: (error: HttpErrorResponse) => {
            this.isSaving = false;
            this.errors['general'] = 'An error occurred while creating the room.';
            console.error('Create Room Error:', error);
          }
        });
      }
    }
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

  validateForm(): boolean {
    this.errors = {};
    let isValid = true;

    if (!this.roomData.hotel) {
      this.errors['hotel'] = 'Please select a hotel';
      isValid = false;
    }

    if (!this.roomData.name || this.roomData.name.trim() === '') {
      this.errors['name'] = 'Room name is required';
      isValid = false;
    }

    if (!this.roomData.description || this.roomData.description.trim() === '') {
      this.errors['description'] = 'Description is required';
      isValid = false;
    }

    if (!this.roomData.imageUrl || this.roomData.imageUrl.trim() === '') {
      this.errors['imageUrl'] = 'Image URL is required';
      isValid = false;
    }

    if (!this.roomData.price || this.roomData.price <= 0) {
      this.errors['price'] = 'Price must be greater than 0';
      isValid = false;
    }

    return isValid;
  }

  closeModal(): void {
    this.close.emit();
  }
}
