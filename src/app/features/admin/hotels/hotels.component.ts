import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HotelService } from "../../../core/services/hotel.service";
import { HotelModalComponent } from "./hotel-modal.component";
import { HotelFormData } from "../../../core/models/hotel.interface";

@Component({
  selector: "app-admin-hotels",
  imports: [CommonModule, FormsModule, HotelModalComponent],
  templateUrl: "./hotels.component.html",
})
export class AdminHotelsComponent implements OnInit {
  hotels: HotelFormData[] = [];
  filteredHotels: HotelFormData[] = [];
  searchTerm = '';

  showHotelModal = false;
  hotelModalEditMode = false;
  hotelToEdit: HotelFormData | null = null;

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
    let filtered = [...this.hotels];

    if (this.searchTerm && this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(hotel =>
        hotel.name.toLowerCase().includes(term) ||
        hotel.address.toLowerCase().includes(term) ||
        hotel.city?.toLowerCase().includes(term)
      );
    }

    this.filteredHotels = filtered;
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
      this.hotelService.updateHotel(Number(this.hotelToEdit?.id), hotelData).subscribe(() => {
        this.fetchHotels();
        this.closeHotelModal();
      });
    } else {
      this.hotelService.createHotel(hotelData).subscribe(() => {
        this.fetchHotels();
        this.closeHotelModal();
      });
    }
  }
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
    console.log("View hotel details", id);
  }
}
