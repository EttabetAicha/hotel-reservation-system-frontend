import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HotelCardComponent } from "../hotel-card/hotel-card.component";
import { FilterSidebarComponent } from "../filter-sidebar/filter-sidebar.component";
import { NavbarComponent } from "../navbar/navbar.component";
import { FooterComponent } from "../footer/footer.component";
import { trigger, transition, style, animate, query, stagger } from "@angular/animations";
import { HotelDetailComponent } from "../hotel-details/hotel-details.component";
import { HotelService } from "../../../core/services/hotel.service";
import { RoomService } from "../../../core/services/room.service";
import { HotelFormData } from "../../../core/models/hotel.interface";

interface FilterOptions {
  priceRange: [number, number];
  stars: number[];
  amenities: string[];
  distance?: string;
}

@Component({
  selector: "app-hotel-listing",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HotelCardComponent,
    FilterSidebarComponent,
    NavbarComponent,
    FooterComponent,
   
  ],
  animations: [
    trigger("fadeIn", [transition(":enter", [style({ opacity: 0 }), animate("400ms ease-in", style({ opacity: 1 }))])]),
    trigger("staggerIn", [
      transition("* => *", [
        query(
          ":enter",
          [
            style({ opacity: 0, transform: "translateY(20px)" }),
            stagger("100ms", [animate("400ms ease-out", style({ opacity: 1, transform: "translateY(0)" }))]),
          ],
          { optional: true }
        ),
      ]),
    ]),
    trigger("slideInRight", [
      transition(":enter", [
        style({ transform: "translateX(100%)", opacity: 0 }),
        animate("300ms ease-out", style({ transform: "translateX(0)", opacity: 1 })),
      ]),
      transition(":leave", [animate("300ms ease-in", style({ transform: "translateX(100%)", opacity: 0 }))]),
    ]),
  ],
  templateUrl: "./hotel-list.component.html",
})
export class HotelListingComponent implements OnInit {
  hotels: HotelFormData[] = [];
  filteredHotels: HotelFormData[] = [];
  paginatedHotels: HotelFormData[] = [];
  isLoading = true;
  viewMode: "grid" | "list" = "grid";
  showMobileFilter = false;
  searchQuery = "";
  sortOption = "recommended";
  selectedHotel: HotelFormData | null = null;
  showHotelDetails = false;

  // Pagination
  currentPage = 1;
  itemsPerPage = 9;
  totalPages = 1;

  // Filter options
  filterOptions: FilterOptions = {
    priceRange: [0, 1000],
    stars: [],
    amenities: [],
    distance: "any",
  };

  constructor(private hotelService: HotelService, private roomService: RoomService) {}

  ngOnInit() {
    this.fetchHotels();
  }

  fetchHotels() {
    this.isLoading = true;
    this.hotelService.getAllHotels().subscribe({
      next: (hotels) => {
        this.hotels = hotels.map((hotel) => ({
          ...hotel,
          originalPrice: Math.floor(Math.random() * 500) + 100,
          discount: Math.floor(Math.random() * 30) + 10,
          price: Math.floor(Math.random() * 300) + 50,
          distance: `${Math.floor(Math.random() * 10) + 1} km`,
          location: `Location ${Math.floor(Math.random() * 100) + 1}`,
        }));
        this.filteredHotels = [...this.hotels];
        this.updatePagination();
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error fetching hotels:", err);
        this.isLoading = false;
      },
    });
  }
  calculateMinValue(value: number, max: number): number {
    return Math.min(value, max);
  }

  toggleFilterSidebar() {
    this.showMobileFilter = !this.showMobileFilter;
  }

  updateFilters(filters: FilterOptions) {
    this.filterOptions = filters;
    this.applyFilters();
  }

  applyFilters() {
    this.isLoading = true;

    setTimeout(() => {
      this.filteredHotels = this.hotels.filter((hotel) => {
        if (hotel.price! < this.filterOptions.priceRange[0] || hotel.price! > this.filterOptions.priceRange[1]) {
          return false;
        }

        if (this.filterOptions.stars.length > 0 && !this.filterOptions.stars.includes(hotel.stars)) {
          return false;
        }

        if (this.filterOptions.amenities.length > 0) {
          const hasAllAmenities = this.filterOptions.amenities.every((amenity) => hotel.amenities.includes(amenity));
          if (!hasAllAmenities) {
            return false;
          }
        }

        if (this.searchQuery) {
          const query = this.searchQuery.toLowerCase();
          return (
            hotel.name.toLowerCase().includes(query) ||
            hotel.city.toLowerCase().includes(query) ||
            hotel.description.toLowerCase().includes(query)
          );
        }

        return true;
      });

      this.sortHotels();
      this.currentPage = 1;
      this.updatePagination();
      this.isLoading = false;
    }, 500);
  }

  sortHotels() {
    switch (this.sortOption) {
      case "price-low":
        this.filteredHotels.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price-high":
        this.filteredHotels.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "rating":
        this.filteredHotels.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
        break;
      case "recommended":
      default:
        this.filteredHotels.sort((a, b) => {
          const scoreA = parseFloat(a.rating) * 20 - (a.price || 0) / 100;
          const scoreB = parseFloat(b.rating) * 20 - (b.price || 0) / 100;
          return scoreB - scoreA;
        });
        break;
    }

    this.updatePagination();
  }


  updatePagination() {
    this.totalPages = Math.ceil(this.filteredHotels.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedHotels = this.filteredHotels.slice(startIndex, startIndex + this.itemsPerPage);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) {
      return;
    }

    this.currentPage = page;
    this.updatePagination();

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  getPageNumbers(): (number | string)[] {
    const pages: (number | string)[] = [];

    if (this.totalPages <= 7) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (this.currentPage > 3) {
        pages.push("...");
      }

      const start = Math.max(2, this.currentPage - 1);
      const end = Math.min(this.totalPages - 1, this.currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (this.currentPage < this.totalPages - 2) {
        pages.push("...");
      }

      pages.push(this.totalPages);
    }

    return pages;
  }

  toggleFavorite(hotelId: string) {
    const hotel = this.hotels.find((h) => h.id === hotelId);
    if (hotel) {
      hotel.isFavorite = !hotel.isFavorite;
    }
  }

  resetFilters() {
    this.filterOptions = {
      priceRange: [0, 1000],
      stars: [],
      amenities: [],
      distance: "any",
    };
    this.searchQuery = "";
    this.applyFilters();
  }

  viewHotelDetails(hotelId: string) {
    this.selectedHotel = this.hotels.find((hotel) => hotel.id === hotelId) || null;
    this.showHotelDetails = true;

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  closeHotelDetails() {
    this.showHotelDetails = false;
    this.selectedHotel = null;
  }
}