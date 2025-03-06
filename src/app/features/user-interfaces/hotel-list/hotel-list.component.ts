import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { HotelCardComponent } from "../hotel-card/hotel-card.component"
import { FilterSidebarComponent } from "../filter-sidebar/filter-sidebar.component"
import type { Hotel } from "../../../core/models/hotel.interface"
import { NavbarComponent } from "../navbar/navbar.component"
import { FooterComponent } from "../footer/footer.component"
import { trigger, transition, style, animate, query, stagger } from "@angular/animations"
import { HotelDetailComponent } from "../hotel-details/hotel-details.component"

interface FilterOptions {
  priceRange: [number, number]
  stars: number[]
  amenities: string[]
  distance?: string
}

interface Room {
  id: number
  name: string
  price: number
  originalPrice?: number
  discount?: number
  image: string
  capacity: number
  features: string[]
  description: string
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
    HotelDetailComponent,
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
  templateUrl: './hotel-list.component.html',
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
  selectedHotel: Hotel | null = null
  showHotelDetails = false

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

  viewHotelDetails(hotelId: number) {
    this.selectedHotel = this.hotels.find((hotel) => hotel.id === hotelId) || null
    this.showHotelDetails = true

    // Scroll to the top if details are shown
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  closeHotelDetails() {
    this.showHotelDetails = false
    this.selectedHotel = null
  }

  generateRoomsForHotel(hotel: Hotel | null): Room[] {
    if (!hotel) return []

    // Room images
    const roomImages = [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1200&auto=format&fit=crop",
    ]

    // Room features
    const features = [
      ["King Bed", "City View", "Free WiFi", "Minibar", "Air Conditioning", "Flat-screen TV"],
      [
        "King Bed",
        "Separate Living Area",
        "City View",
        "Free WiFi",
        "Minibar",
        "Air Conditioning",
        "Flat-screen TV",
        "Bathtub",
      ],
      ["Two Double Beds", "City View", "Free WiFi", "Minibar", "Air Conditioning", "Flat-screen TV"],
    ]

    // Generate rooms based on the hotel
    return [
      {
        id: 1,
        name: "Deluxe King Room",
        price: Math.floor(hotel.price * 1),
        originalPrice: hotel.originalPrice ? Math.floor(hotel.originalPrice * 1) : undefined,
        discount: hotel.discount,
        image: roomImages[0],
        capacity: 2,
        features: features[0],
        description: "Spacious room with a king-sized bed, featuring modern amenities and a stunning city view.",
      },
      {
        id: 2,
        name: "Executive Suite",
        price: Math.floor(hotel.price * 1.5),
        image: roomImages[1],
        capacity: 3,
        features: features[1],
        description: "Luxurious suite with a separate living area, perfect for business travelers or small families.",
      },
      {
        id: 3,
        name: "Premium Double Room",
        price: Math.floor(hotel.price * 1.1),
        originalPrice: hotel.originalPrice ? Math.floor(hotel.originalPrice * 1.1) : undefined,
        discount: hotel.discount,
        image: roomImages[2],
        capacity: 4,
        features: features[2],
        description: "Comfortable room with two double beds, ideal for families or groups.",
      },
    ]
  }
}

