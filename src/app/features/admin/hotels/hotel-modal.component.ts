import { AuthService } from './../../../core/services/auth.service';
import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HotelService } from "../../../core/services/hotel.service";
import { jwtDecode } from 'jwt-decode';


export interface HotelFormData {
  id?: number;
  name: string;
  location: string;
  description: string;
  stars: number;
  amenities: string[];
  images: string[];
  status: "active" | "maintenance" | "closed";
  ownerId: string;
}

@Component({
  selector: "app-hotel-modal",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hotel-modal.component.html',
  styles: [
    `
    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .tab-active {
      color: #4f46e5;
      border-bottom: 2px solid #4f46e5;
    }
  `,
  ],
})
export class HotelModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() editMode = false;
  @Input() hotelToEdit: any = null;
  userName: string | null = '';

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<HotelFormData>();

  hotelData: HotelFormData = this.getEmptyHotelData();
  isSaving = false;
  errors: Record<string, string> = {};
  activeTab: "details" | "rooms" = "details";

  availableAmenities = [
    "Free WiFi",
    "Pool",
    "Spa",
    "Gym",
    "Restaurant",
    "Bar",
    "Room Service",
    "Parking",
    "Air Conditioning",
    "Concierge",
    "Business Center",
    "Laundry",
    "Pet Friendly",
  ];

  roomTypes = ["Single", "Double", "Twin", "Suite", "Deluxe", "Executive", "Family", "Presidential", "Studio"];

  constructor(private hotelService: HotelService, private authService: AuthService) {}

  ngOnInit(): void {
    this.resetForm();
    // Initialize with at least one empty image URL if none exists
    if (!this.hotelData.images || this.hotelData.images.length === 0) {
      this.hotelData.images = [''];
    }
  }

  ngOnChanges(): void {
    if (this.isOpen) {
      if (this.editMode && this.hotelToEdit) {
        // Make a deep copy of the hotel data to avoid reference issues
        this.hotelData = {
          ...this.hotelToEdit,
          // Ensure stars is a number
          stars: Number(this.hotelToEdit.stars),
          // Ensure images is an array
          images: Array.isArray(this.hotelToEdit.images) ? [...this.hotelToEdit.images] : [''],
          // Ensure amenities is an array
          amenities: Array.isArray(this.hotelToEdit.amenities) ? [...this.hotelToEdit.amenities] : []
        };
      } else {
        this.resetForm();
        // Initialize with at least one empty image URL
        if (!this.hotelData.images || this.hotelData.images.length === 0) {
          this.hotelData.images = [''];
        }
      }
    }
  }

  resetForm(): void {
    this.hotelData = this.getEmptyHotelData();
    this.errors = {};
    this.activeTab = "details";
  }

  getEmptyHotelData(): HotelFormData {
    const token = localStorage.getItem('auth-token');
    console.log('Token:', token);

    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        console.log('Decoded token:', decodedToken);
        this.userName = decodedToken.username || decodedToken.name || decodedToken.sub;
        console.log('Set username to:', this.userName);
      } catch (error) {
        console.error('Error decoding token:', error);
        this.userName = null;
      }
    } else {
      this.userName = null;
      console.log('No token found, userName set to null');
    }

    return {
      name: "",
      location: "",
      description: "",
      stars: 3,
      images: [''], // Initialize with one empty image URL
      amenities: [],
      status: "active",
      ownerId: this.userName || '', // Use the extracted owner ID or default to an empty string
    };
  }

  isAmenitySelected(amenity: string): boolean {
    return this.hotelData.amenities?.includes(amenity) || false;
  }

  toggleAmenity(amenity: string): void {
    if (!this.hotelData.amenities) {
      this.hotelData.amenities = [];
    }

    if (this.isAmenitySelected(amenity)) {
      this.hotelData.amenities = this.hotelData.amenities.filter((a) => a !== amenity);
    } else {
      this.hotelData.amenities.push(amenity);
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      case "closed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  getRoomStatusBadgeClass(status: string): string {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "occupied":
        return "bg-blue-100 text-blue-800";
      case "reserved":
        return "bg-yellow-100 text-yellow-800";
      case "maintenance":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  addImage(): void {
    if (!this.hotelData.images) {
      this.hotelData.images = [];
    }
    this.hotelData.images.push('');
  }

  removeImage(index: number): void {
    if (this.hotelData.images && this.hotelData.images.length > 1 && index >= 0 && index < this.hotelData.images.length) {
      this.hotelData.images.splice(index, 1);
    } else if (this.hotelData.images && this.hotelData.images.length === 1) {
      // If it's the last image, clear it but don't remove it
      this.hotelData.images[0] = '';
    }
  }

  validateForm(): boolean {
    this.errors = {};

    if (!this.hotelData.name) {
      this.errors['name'] = 'Hotel name is required.';
    }

    if (!this.hotelData.location) {
      this.errors['location'] = 'Location is required.';
    }

    if (!this.hotelData.description) {
      this.errors['description'] = 'Description is required.';
    }

    if (!this.hotelData.images || this.hotelData.images.length === 0 || !this.hotelData.images[0]) {
      this.errors['images'] = 'At least one image URL is required.';
    }

    if (!this.hotelData.stars || this.hotelData.stars < 1 || this.hotelData.stars > 5) {
      this.errors['stars'] = 'Star rating must be between 1 and 5.';
    }

    if (!this.hotelData.status) {
      this.errors['status'] = 'Status is required.';
    }

    return Object.keys(this.errors).length === 0;
  }

  saveHotel(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isSaving = true;

    if (this.editMode && this.hotelData.id) {
      // this.hotelService.updateHotel(this.hotelData.id, this.hotelData).subscribe({
      //   next: (response) => {
      //     this.isSaving = false;
      //     this.save.emit(response);
      //     this.closeModal();
      //   },
      //   error: (error) => {
      //     this.isSaving = false;
      //     this.errors['general'] = 'An error occurred while updating the hotel.';
      //     console.error('Update Hotel Error:', error);
      //   }
      // });
    } else {
      this.hotelService.createHotel(this.hotelData).subscribe({
        next: (response) => {
          this.isSaving = false;
          this.save.emit(response);
          this.closeModal();
        },
        error: (error) => {
          this.isSaving = false;
          this.errors['general'] = 'An error occurred while creating the hotel.';
          console.error('Create Hotel Error:', error);
        }
      });
    }
  }

  setActiveTab(tab: "details" | "rooms"): void {
    this.activeTab = tab;
  }

  closeModal(): void {
    this.isOpen = false;
    this.close.emit();
  }
}
