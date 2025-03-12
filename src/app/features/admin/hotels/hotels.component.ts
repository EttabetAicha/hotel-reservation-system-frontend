import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HotelModalComponent, type HotelFormData } from "./hotel-modal.component";
import { HotelService } from "../../../core/services/hotel.service";

@Component({
  selector: "app-admin-hotels",
  imports: [CommonModule, FormsModule, HotelModalComponent],
  templateUrl: "./hotels.component.html",
})
export class AdminHotelsComponent implements OnInit {
  hotels: HotelFormData[] = [];
  filteredHotels: HotelFormData[] = [];
  searchTerm = '';

  // Hotel modal
  showHotelModal = false;
  hotelModalEditMode = false;
  hotelToEdit: HotelFormData | null = null;

  // Delete modal
  showDeleteModal = false;
  hotelToDelete: HotelFormData | null = null;
  isDeleting = false;

  constructor(private hotelService: HotelService) {}

  ngOnInit(): void {
    this.fetchHotels();
  }

  fetchHotels(): void {
    this.hotelService.getAllHotels().subscribe((hotels) => {
      this.hotels = hotels;
      this.filteredHotels = [...this.hotels];
    });
  }

  filterHotels(): void {
    if (!this.searchTerm.trim()) {
      this.filteredHotels = [...this.hotels];
      return;
    }

    const term = this.searchTerm.toLowerCase().trim();
    this.filteredHotels = this.hotels.filter(hotel =>
      hotel.name.toLowerCase().includes(term) ||
      hotel.location.toLowerCase().includes(term)
    );
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // Hotel Modal Methods
  openAddHotelModal(): void {
    this.hotelModalEditMode = false;
    this.hotelToEdit = null;
    this.showHotelModal = true;
  }

  editHotel(hotel: HotelFormData): void {
    this.hotelModalEditMode = true;
    this.hotelToEdit = { ...hotel };
    this.showHotelModal = true;
  }

  closeHotelModal(): void {
    this.showHotelModal = false;
  }

  saveHotel(hotelData: HotelFormData): void {
    if (this.hotelModalEditMode && this.hotelToEdit) {
      // Update existing hotel
      this.hotelService.updateHotel(this.hotelToEdit.id!.toString(), hotelData).subscribe(() => {
        this.fetchHotels();
        this.closeHotelModal();
      });
    } else {
      // Add new hotel
      this.hotelService.createHotel(hotelData).subscribe(() => {
        this.fetchHotels();
        this.closeHotelModal();
      });
    }
  }

  // Delete Modal Methods
  openDeleteModal(hotel: HotelFormData): void {
    this.hotelToDelete = hotel;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (!this.hotelToDelete) return;

    this.isDeleting = true;

    this.hotelService.deleteHotel(this.hotelToDelete.id!.toString()).subscribe(() => {
      this.fetchHotels();
      this.isDeleting = false;
      this.showDeleteModal = false;
      this.hotelToDelete = null;
    });
  }

  viewHotelDetails(id: number): void {
    // Implementation for viewing hotel details
    console.log("View hotel details", id);
  }
}
