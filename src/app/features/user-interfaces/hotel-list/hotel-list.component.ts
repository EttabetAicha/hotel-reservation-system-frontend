import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { HotelCardComponent } from "../hotel-card/hotel-card.component"
import { FilterSidebarComponent } from "../filter-sidebar/filter-sidebar.component"
import type { Hotel } from "../../../core/models/hotel.interface"
import { NavbarComponent } from "../navbar/navbar.component"
import { FooterComponent } from "../footer/footer.component"
import { trigger, transition, style, animate, query, stagger } from "@angular/animations"

interface FilterOptions {
  priceRange: [number, number]
  stars: number[]
  amenities: string[]
  distance?: string
}

@Component({
  selector: "app-hotel-listing",
  standalone: true,
  imports: [CommonModule, FormsModule, HotelCardComponent, FilterSidebarComponent, NavbarComponent, FooterComponent],
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
          { optional: true },
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
  template: `
  <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-rose-50">
    <app-navbar></app-navbar>

    <div class="relative">
      <!-- Hero Section -->
      <div class="relative h-[40vh] md:h-[50vh] overflow-hidden">

        <div style="background-image: url('https://images.unsplash.com/photo-1445019980597-93fa8acb246c?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'); background-size: cover; background-position: center;"
        class="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center text-white p-4">
          <h1 class="text-3xl md:text-5xl font-bold mb-4 text-center animate-fade-in-down">Find Your Perfect Stay</h1>
          <p class="text-lg md:text-xl max-w-2xl text-center mb-8 animate-fade-in-up">Discover amazing hotels and accommodations for your next adventure</p>
          <div class="relative w-full max-w-2xl animate-fade-in">
            <input
              type="text"
              placeholder="Search destinations, hotels, or attractions..."
              class="w-full pl-12 pr-4 py-4 rounded-full border-0 shadow-lg text-white  focus:ring-2 focus:ring-indigo-500"
              [(ngModel)]="searchQuery"
              (input)="applyFilters()"
            />
            <div class="absolute left-4 top-4 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <section class="py-12 md:py-20">
      <div class="container mx-auto px-4">
        <!-- Search and sort bar -->
        <div class="bg-white rounded-xl shadow-lg p-5 mb-8 border border-gray-100" @fadeIn>
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="flex items-center">
              <label class="mr-2 text-gray-700 whitespace-nowrap font-medium">Sort by:</label>
              <select
                class="rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 py-2 px-3"
                [(ngModel)]="sortOption"
                (change)="sortHotels()"
              >
                <option value="recommended">Recommended</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Rating</option>
              </select>
            </div>

            <div class="hidden md:flex items-center gap-2">
              <button
                (click)="viewMode = 'grid'"
                [class.bg-indigo-50]="viewMode === 'grid'"
                [class.text-indigo-600]="viewMode === 'grid'"
                class="p-2 rounded-md hover:bg-indigo-50 transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                (click)="viewMode = 'list'"
                [class.bg-indigo-50]="viewMode === 'list'"
                [class.text-indigo-600]="viewMode === 'list'"
                class="p-2 rounded-md hover:bg-indigo-50 transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            <button
              (click)="toggleFilterSidebar()"
              class="md:hidden flex items-center gap-1 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Filters
            </button>
          </div>
        </div>

        <div class="flex flex-col md:flex-row gap-6">
          <!-- Filter sidebar (desktop) -->
          <div class="hidden md:block w-64 flex-shrink-0" @fadeIn>
            <app-filter-sidebar
              [filterOptions]="filterOptions"
              (filterChange)="updateFilters($event)"
            ></app-filter-sidebar>
          </div>

          <!-- Mobile filter sidebar -->
          <div
            *ngIf="showMobileFilter"
            class="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden"
            (click)="toggleFilterSidebar()"
          >
            <div
              class="absolute right-0 top-0 bottom-0 w-80 bg-white p-4 overflow-y-auto"
              (click)="$event.stopPropagation()"
              @slideInRight
            >
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-bold">Filters</h3>
                <button (click)="toggleFilterSidebar()" class="text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <app-filter-sidebar
                [filterOptions]="filterOptions"
                (filterChange)="updateFilters($event)"
              ></app-filter-sidebar>
              <div class="mt-6">
                <button
                  (click)="toggleFilterSidebar()"
                  class="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-300"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>

          <!-- Hotel listings -->
          <div class="flex-grow" @fadeIn>
            <div class="mb-6 flex justify-between items-center">
              <h2 class="text-xl font-bold text-gray-800">{{ filteredHotels.length }} hotels found</h2>
              <div class="text-sm text-gray-500">
                Showing {{ (currentPage - 1) * itemsPerPage + 1 }}-{{ Math.min(currentPage * itemsPerPage, filteredHotels.length) }} of {{ filteredHotels.length }}
              </div>
            </div>

            <!-- Grid view -->
            <div *ngIf="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" @staggerIn>
              <app-hotel-card
                *ngFor="let hotel of paginatedHotels"
                [hotel]="hotel"
                [viewMode]="viewMode"
                (toggleFavorite)="toggleFavorite($event)"
              ></app-hotel-card>
            </div>

            <!-- List view -->
            <div *ngIf="viewMode === 'list'" class="space-y-6" @staggerIn>
              <app-hotel-card
                *ngFor="let hotel of paginatedHotels"
                [hotel]="hotel"
                [viewMode]="viewMode"
                (toggleFavorite)="toggleFavorite($event)"
              ></app-hotel-card>
            </div>

            <!-- Loading state -->
            <div *ngIf="isLoading" class="flex justify-center my-12">
              <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>

            <!-- Empty state -->
            <div *ngIf="filteredHotels.length === 0 && !isLoading" class="bg-white rounded-xl shadow-lg p-8 text-center my-8 border border-gray-100" @fadeIn>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 class="text-lg font-bold mb-2">No hotels found</h3>
              <p class="text-gray-600 mb-4">Try adjusting your filters or search criteria</p>
              <button
                (click)="resetFilters()"
                class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-300"
              >
                Reset Filters
              </button>
            </div>

            <!-- Pagination -->
            <div *ngIf="filteredHotels.length > 0" class="mt-8 flex justify-center" @fadeIn>
              <div class="flex space-x-1">
                <button
                  (click)="goToPage(currentPage - 1)"
                  [disabled]="currentPage === 1"
                  [class.opacity-50]="currentPage === 1"
                  [class.cursor-not-allowed]="currentPage === 1"
                  class="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-100 transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <ng-container *ngFor="let page of getPageNumbers()">
                  <button
                    *ngIf="page !== '...'"
                    (click)="goToPage(+page)"
                    [class.bg-indigo-600]="currentPage === page"
                    [class.text-white]="currentPage === page"
                    class="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-100 transition-colors duration-200"
                  >
                    {{ page }}
                  </button>
                  <span *ngIf="page === '...'" class="px-3 py-1">...</span>
                </ng-container>

                <button
                  (click)="goToPage(currentPage + 1)"
                  [disabled]="currentPage === totalPages"
                  [class.opacity-50]="currentPage === totalPages"
                  [class.cursor-not-allowed]="currentPage === totalPages"
                  class="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-100 transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <app-footer></app-footer>
  </div>
  `,
})
export class HotelListingComponent implements OnInit {
  hotels: Hotel[] = []
  filteredHotels: Hotel[] = []
  paginatedHotels: Hotel[] = []
  isLoading = true
  viewMode: "grid" | "list" = "grid"
  showMobileFilter = false
  searchQuery = ""
  sortOption = "recommended"

  // Pagination
  currentPage = 1
  itemsPerPage = 9
  totalPages = 1

  // Filter options
  filterOptions: FilterOptions = {
    priceRange: [0, 1000],
    stars: [],
    amenities: [],
    distance: "any",
  }

  // For template use
  Math = Math

  ngOnInit() {
    // Simulate API call
    setTimeout(() => {
      this.hotels = this.generateHotels()
      this.filteredHotels = [...this.hotels]
      this.updatePagination()
      this.isLoading = false
    }, 1000)
  }

  generateHotels(): Hotel[] {
    const locations = ["New York", "Los Angeles", "Chicago", "Miami", "San Francisco", "Las Vegas", "Boston", "Seattle"]
    const amenities = [
      "Free WiFi",
      "Pool",
      "Spa",
      "Gym",
      "Restaurant",
      "Bar",
      "Room Service",
      "Parking",
      "Pet Friendly",
      "Airport Shuttle",
    ]
    const hotelNames = [
      "Grand Plaza Hotel",
      "Seaside Resort",
      "Urban Loft Suites",
      "Mountain View Lodge",
      "Riverside Inn",
      "The Royal Palace",
      "Sunset Beach Resort",
      "City Center Hotel",
      "Harbor View Hotel",
      "The Metropolitan",
      "Lakeside Resort",
      "The Landmark Hotel",
      "Ocean Breeze Resort",
      "Heritage Grand Hotel",
      "Downtown Suites",
      "Skyline Hotel",
      "The Continental",
      "Palm Paradise Resort",
      "The Ritz Plaza",
      "Luxury Towers Hotel",
      "Comfort Inn & Suites",
      "The Peninsula",
      "Golden Gate Lodge",
      "Silver Bay Resort",
    ]

    // Unsplash hotel images
    const hotelImages = [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=1200&auto=format&fit=crop",
    ]

    return Array(24)
      .fill(0)
      .map((_, index) => {
        const price = Math.floor(Math.random() * 900) + 100
        const hasDiscount = Math.random() > 0.7
        const discount = hasDiscount ? Math.floor(Math.random() * 30) + 10 : 0
        const originalPrice = hasDiscount ? Math.floor(price * (100 / (100 - discount))) : undefined

        return {
          id: index + 1,
          name: hotelNames[index % hotelNames.length],
          location: locations[Math.floor(Math.random() * locations.length)],
          price: price,
          originalPrice: originalPrice,
          discount: hasDiscount ? discount : undefined,
          rating: Number((Math.random() * 2 + 3).toFixed(1)),
          reviewCount: Math.floor(Math.random() * 1000) + 50,
          image: hotelImages[index % hotelImages.length],
          amenities: Array(Math.floor(Math.random() * 5) + 3)
            .fill(0)
            .map(() => amenities[Math.floor(Math.random() * amenities.length)])
            .filter((value, i, self) => self.indexOf(value) === i), // Remove duplicates
          stars: Math.floor(Math.random() * 3) + 3,
          isFavorite: false,
          distance: `${(Math.random() * 10).toFixed(1)} km from center`,
          description:
            "This luxurious hotel offers comfortable accommodations with modern amenities. Guests can enjoy the convenient location, exceptional service, and relaxing atmosphere.",
        }
      })
  }

  toggleFilterSidebar() {
    this.showMobileFilter = !this.showMobileFilter
  }

  updateFilters(filters: FilterOptions) {
    this.filterOptions = filters
    this.applyFilters()
  }

  applyFilters() {
    this.isLoading = true

    // Simulate API delay
    setTimeout(() => {
      this.filteredHotels = this.hotels.filter((hotel) => {
        // Price filter
        if (hotel.price < this.filterOptions.priceRange[0] || hotel.price > this.filterOptions.priceRange[1]) {
          return false
        }

        // Star rating filter
        if (this.filterOptions.stars.length > 0 && !this.filterOptions.stars.includes(hotel.stars)) {
          return false
        }

        // Amenities filter
        if (this.filterOptions.amenities.length > 0) {
          const hasAllAmenities = this.filterOptions.amenities.every((amenity) => hotel.amenities.includes(amenity))
          if (!hasAllAmenities) {
            return false
          }
        }

        // Search query
        if (this.searchQuery) {
          const query = this.searchQuery.toLowerCase()
          return (
            hotel.name.toLowerCase().includes(query) ||
            hotel.location.toLowerCase().includes(query) ||
            hotel.description.toLowerCase().includes(query)
          )
        }

        return true
      })

      this.sortHotels()
      this.currentPage = 1
      this.updatePagination()
      this.isLoading = false
    }, 500)
  }

  sortHotels() {
    switch (this.sortOption) {
      case "price-low":
        this.filteredHotels.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        this.filteredHotels.sort((a, b) => b.price - a.price)
        break
      case "rating":
        this.filteredHotels.sort((a, b) => b.rating - a.rating)
        break
      case "recommended":
      default:
        // Sort by a combination of rating and price (just an example)
        this.filteredHotels.sort((a, b) => {
          const scoreA = a.rating * 20 - a.price / 100
          const scoreB = b.rating * 20 - b.price / 100
          return scoreB - scoreA
        })
        break
    }

    this.updatePagination()
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredHotels.length / this.itemsPerPage)
    const startIndex = (this.currentPage - 1) * this.itemsPerPage
    this.paginatedHotels = this.filteredHotels.slice(startIndex, startIndex + this.itemsPerPage)
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) {
      return
    }

    this.currentPage = page
    this.updatePagination()

    // Scroll to top of results
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  getPageNumbers(): (number | string)[] {
    const pages: (number | string)[] = []

    if (this.totalPages <= 7) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)

      if (this.currentPage > 3) {
        pages.push("...")
      }

      const start = Math.max(2, this.currentPage - 1)
      const end = Math.min(this.totalPages - 1, this.currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (this.currentPage < this.totalPages - 2) {
        pages.push("...")
      }

      pages.push(this.totalPages)
    }

    return pages
  }

  toggleFavorite(hotelId: number) {
    const hotel = this.hotels.find((h) => h.id === hotelId)
    if (hotel) {
      hotel.isFavorite = !hotel.isFavorite
    }
  }

  resetFilters() {
    this.filterOptions = {
      priceRange: [0, 1000],
      stars: [],
      amenities: [],
      distance: "any",
    }
    this.searchQuery = ""
    this.applyFilters()
  }
}

