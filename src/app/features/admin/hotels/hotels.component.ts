import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { HotelModalComponent, type HotelFormData } from "./hotel-modal.component"

interface Hotel {
  id: number
  name: string
  location: string
  description: string
  image: string
  stars: number
  rooms: number
  rating: number
  status: 'active' | 'maintenance' | 'closed'
  amenities: string[]
}

@Component({
  selector: "app-admin-hotels",
  standalone: true,
  imports: [CommonModule, FormsModule, HotelModalComponent],
  templateUrl: "./hotels.component.html",
})
export class AdminHotelsComponent implements OnInit {
  hotels: Hotel[] = []
  filteredHotels: Hotel[] = []
  searchTerm = ''

  // Hotel modal
  showHotelModal = false
  hotelModalEditMode = false
  hotelToEdit: Hotel | null = null

  // Delete modal
  showDeleteModal = false
  hotelToDelete: Hotel | null = null
  isDeleting = false

  constructor() {}

  ngOnInit(): void {
    // Fetch hotels data
    this.hotels = this.generateMockHotels()
    this.filteredHotels = [...this.hotels]
  }

  generateMockHotels(): Hotel[] {
    return [
      {
        id: 1,
        name: 'Grand Plaza Hotel',
        location: 'New York, NY',
        description: 'Luxury hotel in the heart of Manhattan with stunning city views and world-class amenities.',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop',
        stars: 5,
        rooms: 120,
        rating: 4.8,
        status: 'active',
        amenities: ['Free WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant']
      },
      {
        id: 2,
        name: 'Seaside Resort',
        location: 'Miami, FL',
        description: 'Beachfront resort offering spectacular ocean views, private beach access, and luxury spa treatments.',
        image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=1200&auto=format&fit=crop',
        stars: 4,
        rooms: 85,
        rating: 4.5,
        status: 'active',
        amenities: ['Free WiFi', 'Pool', 'Beach Access', 'Spa', 'Restaurant']
      },
      {
        id: 3,
        name: 'Urban Loft Suites',
        location: 'Chicago, IL',
        description: 'Contemporary loft-style accommodations in downtown Chicago, perfect for business and leisure travelers.',
        image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=1200&auto=format&fit=crop',
        stars: 4,
        rooms: 60,
        rating: 4.3,
        status: 'maintenance',
        amenities: ['Free WiFi', 'Gym', 'Business Center', 'Room Service']
      },
      {
        id: 4,
        name: 'Mountain View Lodge',
        location: 'Denver, CO',
        description: 'Rustic mountain retreat with breathtaking views and outdoor activities for all seasons.',
        image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop',
        stars: 3,
        rooms: 45,
        rating: 4.1,
        status: 'active',
        amenities: ['Free WiFi', 'Fireplace', 'Hiking Trails', 'Restaurant']
      },
      {
        id: 5,
        name: 'Luxury Bay Hotel',
        location: 'San Francisco, CA',
        description: 'Elegant waterfront hotel offering panoramic bay views and sophisticated accommodations.',
        image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1200&auto=format&fit=crop',
        stars: 5,
        rooms: 150,
        rating: 4.9,
        status: 'active',
        amenities: ['Free WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Room Service']
      },
      {
        id: 6,
        name: 'Historic Downtown Inn',
        location: 'Boston, MA',
        description: 'Charming boutique hotel in a restored historic building in the heart of Boston.',
        image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=1200&auto=format&fit=crop',
        stars: 3,
        rooms: 30,
        rating: 4.2,
        status: 'closed',
        amenities: ['Free WiFi', 'Breakfast', 'Concierge', 'Business Center']
      }
    ]
  }

  filterHotels(): void {
    if (!this.searchTerm.trim()) {
      this.filteredHotels = [...this.hotels]
      return
    }

    const term = this.searchTerm.toLowerCase().trim()
    this.filteredHotels = this.hotels.filter(hotel =>
      hotel.name.toLowerCase().includes(term) ||
      hotel.location.toLowerCase().includes(term)
    )
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800'
      case 'closed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Hotel Modal Methods
  openAddHotelModal(): void {
    this.hotelModalEditMode = false
    this.hotelToEdit = null
    this.showHotelModal = true
  }

  editHotel(hotel: Hotel): void {
    this.hotelModalEditMode = true
    this.hotelToEdit = { ...hotel }
    this.showHotelModal = true
  }

  closeHotelModal(): void {
    this.showHotelModal = false
  }

  saveHotel(hotelData: HotelFormData): void {
    console.log("Saving hotel data:", hotelData)

    if (this.hotelModalEditMode && this.hotelToEdit) {
      // Update existing hotel
      const index = this.hotels.findIndex((h) => h.id === this.hotelToEdit!.id)
      if (index !== -1) {
        this.hotels[index] = {
          ...this.hotels[index],
          ...hotelData,
          // Make sure to update the rooms count based on the rooms array
          rooms: hotelData.rooms ? hotelData.rooms.length : 0,
        }
      }
    } else {
      // Add new hotel
      const newHotel: Hotel = {
        ...hotelData,
        id: this.getNextHotelId(),
        // Set rooms count based on the rooms array
        rooms: hotelData.rooms ? hotelData.rooms.length : 0,
        rating: 0, // Default value for new hotels
      }
      this.hotels.unshift(newHotel)
    }

    // Refresh filtered hotels
    this.filterHotels()
  }

  getNextHotelId(): number {
    return Math.max(...this.hotels.map((h) => h.id), 0) + 1
  }

  // Delete Modal Methods
  openDeleteModal(hotel: Hotel): void {
    this.hotelToDelete = hotel
    this.showDeleteModal = true
  }

  confirmDelete(): void {
    if (!this.hotelToDelete) return

    this.isDeleting = true

    // Simulate API call
    setTimeout(() => {
      this.hotels = this.hotels.filter((h) => h.id !== this.hotelToDelete!.id)
      this.filterHotels()
      this.isDeleting = false
      this.showDeleteModal = false
      this.hotelToDelete = null
    }, 1000)
  }

  viewHotelDetails(id: number): void {
    // Implementation for viewing hotel details
    console.log("View hotel details", id)
  }
}
