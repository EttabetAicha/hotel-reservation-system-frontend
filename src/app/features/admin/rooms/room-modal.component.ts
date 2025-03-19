import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RoomFormData, RoomStatus, RoomType } from "../../../core/models/room.interface";
import { HotelFormData } from "../../../core/models/hotel.interface";
import { RoomService } from "../../../core/services/room.service";
import { HttpErrorResponse } from "@angular/common/http";
import Swal from 'sweetalert2';

@Component({
  selector: "app-room-modal",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./room-modal.component.html",
  styles: [
    `
    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    `
  ]
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

  isHotelSelected(hotelId: number | string): boolean {
    if (!hotelId || !this.roomData.hotel) {
      return false;
    }
    return String(this.roomData.hotel) === String(hotelId);
  }

  ngOnChanges(): void {
    if (this.isOpen) {
      if (this.editMode && this.roomToEdit) {
        console.log('roomToEdit before assignment:', this.roomToEdit);
        this.roomData = {
          ...this.roomToEdit,
          hotel: this.roomToEdit.hotel || ''
        };

        console.log('roomData after assignment:', this.roomData);
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
      hotel: "",
      roomNumber: '',
      type: RoomType.SINGLE,
      price: 100,
      isAvailable: true,
      description: '',
      imageUrl: '',
      status: RoomStatus.AVAILABLE,
    };
  }

  showAlert(title: string, text: string, icon: 'success' | 'error' | 'warning' | 'info'): void {
    Swal.fire({
      title,
      text,
      icon,
      confirmButtonColor: '#4f46e5',
      timer: 3000
    });
  }

  showErrorAlert(error: HttpErrorResponse): void {
    const errorMessage = this.getErrorMessage(error);
    Swal.fire({
      title: 'Error',
      text: errorMessage,
      icon: 'error',
      confirmButtonColor: '#4f46e5'
    });
  }

  saveRoom(): void {
    if (this.validateForm()) {
      this.isSaving = true;

      const payload: RoomFormData = {
        ...this.roomData
      };

      if (this.editMode && this.roomData.id) {
        this.roomService.updateRoomData(this.roomData.id, payload).subscribe({
          next: (response) => {
            this.isSaving = false;
            console.log('Update response:', response);

            this.save.emit(response);
            this.showAlert('Success', 'Room updated successfully!', 'success');
            this.closeModal();
          },
          error: (error: HttpErrorResponse) => {
            this.isSaving = false;
            this.errors['general'] = this.getErrorMessage(error);
            this.showErrorAlert(error);
            console.error('Update Room Error:', error);
          }
        });
      } else {
        if (!this.roomData.hotel) {
          this.isSaving = false;
          this.errors['hotel'] = 'Please select a hotel';
          this.showAlert('Error', 'Please select a hotel before creating a room', 'error');
          return;
        }

        this.roomService.createRoomData(payload, this.roomData.hotel).subscribe({
          next: (response) => {
            this.isSaving = false;
            this.save.emit(response);
            this.showAlert('Success', 'Room created successfully!', 'success');
            this.closeModal();
          },
          error: (error: HttpErrorResponse) => {
            this.isSaving = false;
            this.errors['general'] = this.getErrorMessage(error);
            this.showErrorAlert(error);
            console.error('Create Room Error:', error);
          }
        });
      }
    }
  }

  getErrorMessage(error: HttpErrorResponse): string {
    if (error.error && error.error.message) {
      return error.error.message;
    } else if (error.status === 0) {
      return 'Network error. Please check your connection.';
    } else if (error.status === 400) {
      return 'Invalid data provided. Please check your inputs.';
    } else if (error.status === 401) {
      return 'Unauthorized. Please log in again.';
    } else if (error.status === 403) {
      return 'You do not have permission to perform this action.';
    } else if (error.status === 404) {
      return 'Resource not found. The hotel or room may have been deleted.';
    } else {
      return `An error occurred (${error.status}). Please try again later.`;
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


  if (!this.editMode && !this.roomData.hotel) {
    this.errors['hotel'] = 'Please select a hotel';
    isValid = false;
  }

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

    if (!isValid) {
      this.showAlert('Validation Error', 'Please correct the errors in the form', 'warning');
    }

    return isValid;
  }

  closeModal(): void {
    this.close.emit();
  }
}