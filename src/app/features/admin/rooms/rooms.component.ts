import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { RoomModalComponent, type RoomFormData } from "./room-modal.component"

interface Room {
  id: number
  hotelId: number
  hotelName: string
  name: string
  type: string
  capacity: number
  price: number
  status: 'available' | 'occupied' | 'maintenance' | 'reserved'
  amenities: string[]
  image: string
  description: string
}

interface Hotel {
  id: number
  name: string
}

@Component({
  selector: "app-admin-rooms",
  standalone: true,
  imports: [CommonModule, FormsModule, RoomModalComponent],
  templateUrl: "./rooms.component.html",
})
export class AdminRoomsComponent implements OnInit {
  rooms: Room[] = []
  filteredRooms: Room[] = []
  hotels: Hotel[] = [
    { id: 1, name: 'Grand Plaza Hotel' },
    { id: 2, name: 'Seaside Resort' },
    { id: 3, name: 'Urban Loft Suites' },
    { id: 4, name: 'Mountain View Lodge' }
  ]
  searchTerm = ''
  filterHotel = 0

  // Room modal
  showRoomModal = false
  roomModalEditMode = false
  roomToEdit: Room | null = null

  // Delete modal
  showDeleteModal = false
  roomToDelete: Room | null = null
  isDeleting = false

  constructor() {}

  ngOnInit(): void {
    // Fetch rooms data
    this.rooms = this.generateMockRooms()
    this.filterRooms()
  }

  generateMockRooms(): Room[] {
    return [
      {
        id: 1,
        hotelId: 1,
        hotelName: 'Grand Plaza Hotel',
        name: 'Deluxe King Room',
        type: 'Deluxe',
        capacity: 2,
        price: 250,
        status: 'available',
        description: 'Spacious room with a king-sized bed, city view, and modern amenities for a comfortable stay.',
        amenities: ['Free WiFi', 'Air Conditioning', 'Mini Bar', 'Room Service', 'TV'],
        image: 'https://images.unsplash.com/photo-1568495248636-6432b97bd949?fm=jpg&q=60&w=3000'
      },
      {
        id: 2,
        hotelId: 1,
        hotelName: 'Grand Plaza Hotel',
        name: 'Executive Suite',
        type: 'Suite',
        capacity: 4,
        price: 450,
        status: 'occupied',
        description: 'Luxurious suite with separate living area, premium amenities, and exceptional city views.',
        amenities: ['Free WiFi', 'Air Conditioning', 'Mini Bar', 'Room Service', 'TV', 'Jacuzzi'],
        image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1200'
      },
      {
        id: 3,
        hotelId: 2,
        hotelName: 'Seaside Resort',
        name: 'Ocean View Room',
        type: 'Standard',
        capacity: 2,
        price: 320,
        status: 'available',
        description: 'Comfortable room with a breathtaking view of the ocean and direct access to the beach.',
        amenities: ['Free WiFi', 'Air Conditioning', 'Balcony', 'TV'],
        image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?fm=jpg&q=60&w=3000'
      },
      {
        id: 4,
        hotelId: 2,
        hotelName: 'Seaside Resort',
        name: 'Family Suite',
        type: 'Suite',
        capacity: 6,
        price: 550,
        status: 'reserved',
        description: 'Spacious suite designed for families, with multiple bedrooms and a fully equipped kitchen.',
        amenities: ['Free WiFi', 'Air Conditioning', 'Kitchen', 'Balcony', 'TV', 'Washer/Dryer'],
        image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?fm=jpg&q=60&w=3000'
      },
      {
        id: 5,
        hotelId: 3,
        hotelName: 'Urban Loft Suites',
        name: 'Studio Apartment',
        type: 'Studio',
        capacity: 2,
        price: 180,
        status: 'available',
        description: 'Modern studio apartment with stylish décor and essential amenities for a comfortable urban stay.',
        amenities: ['Free WiFi', 'Air Conditioning', 'Kitchenette', 'TV'],
        image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?fm=jpg&q=60&w=3000'
      },
      {
        id: 6,
        hotelId: 3,
        hotelName: 'Urban Loft Suites',
        name: 'Penthouse Suite',
        type: 'Penthouse',
        capacity: 4,
        price: 650,
        status: 'maintenance',
        description: 'Exclusive penthouse with panoramic city views, luxury furnishings, and a private terrace.',
        amenities: ['Free WiFi', 'Air Conditioning', 'Full Kitchen', 'Private Terrace', 'TV', 'Fireplace'],
        image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?fm=jpg&q=60&w=3000'
      },
      {
        id: 7,
        hotelId: 4,
        hotelName: 'Mountain View Lodge',
        name: 'Cabin Room',
        type: 'Standard',
        capacity: 2,
        price: 220,
        status: 'available',
        description: 'Cozy cabin-style room with rustic charm and beautiful mountain views.',
        amenities: ['Free WiFi', 'Fireplace', 'Mountain View', 'TV'],
        image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1200'
      },
      {
        id: 8,
        hotelId: 4,
        hotelName: 'Mountain View Lodge',
        name: 'Luxury Chalet',
        type: 'Chalet',
        capacity: 8,
        price: 850,
        status: 'available',
        description: 'Spacious chalet with multiple bedrooms, a full kitchen, hot tub, and stunning mountain views.',
        amenities: ['Free WiFi', 'Fireplace', 'Full Kitchen', 'Hot Tub', 'Mountain View', 'TV'],
        image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=1200'
      }
    ]
  }

  filterRooms(): void {
    let filtered = [...this.rooms]

    // Apply hotel filter
    if (this.filterHotel !== 0) {
      filtered = filtered.filter(room => room.hotelId === this.filterHotel)
    }

    // Apply search term filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim()
      filtered = filtered.filter(room =>
        room.name.toLowerCase().includes(term) ||
        room.hotelName.toLowerCase().includes(term) ||
        room.type.toLowerCase().includes(term)
      )
    }

    this.filteredRooms = filtered
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800'
      case 'occupied':
        return 'bg-blue-100 text-blue-800'
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800'
      case 'maintenance':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Room Modal Methods
  openAddRoomModal(): void {
    this.roomModalEditMode = false
    this.roomToEdit = null
    this.showRoomModal = true
  }

  editRoom(room: Room): void {
    this.roomModalEditMode = true
    this.roomToEdit = { ...room }
    this.showRoomModal = true
  }

  closeRoomModal(): void {
    this.showRoomModal = false
  }

  saveRoom(roomData: RoomFormData): void {
    // Find the hotel name based on the hotel ID
    const hotelName = this.hotels.find(h => h.id === roomData.hotelId)?.name || 'Unknown Hotel'

    if (this.roomModalEditMode && this.roomToEdit) {
      // Update existing room
      const index = this.rooms.findIndex(r => r.id === this.roomToEdit!.id)
      if (index !== -1) {
        this.rooms[index] = {
          ...this.rooms[index],
          ...roomData,
          hotelName
        }
      }
    } else {
      // Add new room
      const newRoom: Room = {
        ...roomData,
        id: this.getNextRoomId(),
        hotelName
      }
      this.rooms.unshift(newRoom)
    }

    // Refresh filtered rooms
    this.filterRooms()
  }

  getNextRoomId(): number {
    return Math.max(...this.rooms.map(r => r.id)) + 1
  }

  // Delete Modal Methods
  openDeleteModal(room: Room): void {
    this.roomToDelete = room
    this.showDeleteModal = true
  }

  confirmDelete(): void {
    if (!this.roomToDelete) return

    this.isDeleting = true

    // Simulate API call
    setTimeout(() => {
      this.rooms = this.rooms.filter(r => r.id !== this.roomToDelete!.id)
      this.filterRooms()
      this.isDeleting = false
      this.showDeleteModal = false
      this.roomToDelete = null
    }, 1000)
  }

  viewRoomDetails(id: number): void {
    // Implementation for viewing room details
    console.log('View room details', id)
  }
}
