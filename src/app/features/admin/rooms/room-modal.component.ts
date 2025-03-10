import { Component, Input, Output, EventEmitter, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"

interface Hotel {
  id: number
  name: string
}

export interface RoomFormData {
  id?: number
  hotelId: number
  name: string
  type: string
  capacity: number
  price: number
  status: 'available' | 'occupied' | 'maintenance' | 'reserved'
  description: string
  amenities: string[]
  image: string
}

@Component({
  selector: "app-room-modal",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
           [class.animate-fadeIn]="isOpen"
           (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="p-6 border-b border-gray-200">
          <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-gray-800">{{editMode ? 'Edit Room' : 'Add New Room'}}</h2>
            <button (click)="closeModal()" class="text-gray-500 hover:text-gray-700 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Body -->
        <div class="p-6">
          <form (ngSubmit)="saveRoom()">
            <!-- Basic Information -->
            <div class="mb-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>

              <!-- Hotel Selection -->
              <div class="mb-4">
                <label for="hotel-select" class="block text-sm font-medium text-gray-700 mb-1">Hotel*</label>
                <select
                  id="hotel-select"
                  name="hotelId"
                  [(ngModel)]="roomData.hotelId"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option [ngValue]="0" disabled>Select Hotel</option>
                  <option *ngFor="let hotel of hotels" [ngValue]="hotel.id">{{hotel.name}}</option>
                </select>
                <div *ngIf="errors['hotelId']" class="mt-1 text-sm text-red-600">{{errors['hotelId']}}</div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="room-name" class="block text-sm font-medium text-gray-700 mb-1">Room Name*</label>
                  <input
                    type="text"
                    id="room-name"
                    name="name"
                    [(ngModel)]="roomData.name"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                  <div *ngIf="errors['name']" class="mt-1 text-sm text-red-600">{{errors['name']}}</div>
                </div>

                <div>
                  <label for="room-type" class="block text-sm font-medium text-gray-700 mb-1">Room Type*</label>
                  <select
                    id="room-type"
                    name="type"
                    [(ngModel)]="roomData.type"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Suite">Suite</option>
                    <option value="Executive">Executive</option>
                    <option value="Penthouse">Penthouse</option>
                    <option value="Studio">Studio</option>
                    <option value="Chalet">Chalet</option>
                    <option value="Family">Family</option>
                  </select>
                  <div *ngIf="errors['type']" class="mt-1 text-sm text-red-600">{{errors['type']}}</div>
                </div>
              </div>
            </div>

            <!-- Details -->
            <div class="mb-6">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label for="room-capacity" class="block text-sm font-medium text-gray-700 mb-1">Capacity*</label>
                  <input
                    type="number"
                    id="room-capacity"
                    name="capacity"
                    [(ngModel)]="roomData.capacity"
                    min="1"
                    max="10"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                  <div *ngIf="errors['capacity']" class="mt-1 text-sm text-red-600">{{errors['capacity']}}</div>
                </div>

                <div>
                  <label for="room-price" class="block text-sm font-medium text-gray-700 mb-1">Price Per Night ($)*</label>
                  <input
                    type="number"
                    id="room-price"
                    name="price"
                    [(ngModel)]="roomData.price"
                    min="1"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                  <div *ngIf="errors['price']" class="mt-1 text-sm text-red-600">{{errors['price']}}</div>
                </div>

                <div>
                  <label for="room-status" class="block text-sm font-medium text-gray-700 mb-1">Status*</label>
                  <select
                    id="room-status"
                    name="status"
                    [(ngModel)]="roomData.status"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="reserved">Reserved</option>
                  </select>
                  <div *ngIf="errors['status']" class="mt-1 text-sm text-red-600">{{errors['status']}}</div>
                </div>
              </div>
            </div>

            <!-- Description -->
            <div class="mb-6">
              <label for="room-description" class="block text-sm font-medium text-gray-700 mb-1">Description*</label>
              <textarea
                id="room-description"
                name="description"
                [(ngModel)]="roomData.description"
                rows="3"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              ></textarea>
              <div *ngIf="errors['description']" class="mt-1 text-sm text-red-600">{{errors['description']}}</div>
            </div>

            <!-- Image URL -->
            <div class="mb-6">
              <label for="room-image" class="block text-sm font-medium text-gray-700 mb-1">Image URL*</label>
              <input
                type="text"
                id="room-image"
                name="image"
                [(ngModel)]="roomData.image"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
              <div *ngIf="errors['image']" class="mt-1 text-sm text-red-600">{{errors['image']}}</div>
            </div>

            <!-- Amenities -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div *ngFor="let amenity of availableAmenities" class="flex items-center">
                  <input
                    type="checkbox"
                    [id]="'amenity-' + amenity.replace(' ', '-')"
                    [checked]="isAmenitySelected(amenity)"
                    (change)="toggleAmenity(amenity)"
                    class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  >
                  <label [for]="'amenity-' + amenity.replace(' ', '-')" class="ml-2 block text-sm text-gray-700">
                    {{amenity}}
                  </label>
                </div>
              </div>
            </div>

            <!-- Preview -->
            <div class="mb-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Preview</h3>
              <div class="bg-gray-100 p-4 rounded-lg">
                <div class="flex flex-col md:flex-row gap-4">
                  <div class="md:w-1/3">
                    <img
                      [src]="roomData.image || 'https://via.placeholder.com/400x300?text=Room+Image'"
                      alt="Room preview"
                      class="w-full h-48 object-cover rounded-lg"
                    >
                  </div>
                  <div class="md:w-2/3">
                    <h4 class="text-xl font-bold text-gray-800">{{roomData.name || 'Room Name'}}</h4>
                    <div class="flex items-center mt-1 mb-2">
                      <span
                        [class]="getStatusBadgeClass(roomData.status)"
                        class="px-2 py-1 text-xs font-bold rounded-full uppercase"
                      >
                        {{roomData.status}}
                      </span>
                      <span class="ml-3 text-gray-700 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {{roomData.capacity}} guests
                      </span>
                      <span class="ml-3 text-lg font-bold text-indigo-600">{{roomData.price | currency}}</span>
                    </div>
                    <p class="text-gray-700">{{roomData.description || 'Room description will appear here.'}}</p>
                    <div class="mt-2 flex flex-wrap gap-2">
                      <span *ngFor="let amenity of roomData.amenities.slice(0, 3)" class="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
                        {{amenity}}
                      </span>
                      <span *ngIf="roomData.amenities.length > 3" class="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
                        +{{roomData.amenities.length - 3}} more
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex justify-end space-x-4">
              <button
                type="button"
                (click)="closeModal()"
                class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="isSaving"
                class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                <span *ngIf="isSaving" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
                <span *ngIf="!isSaving">{{editMode ? 'Update Room' : 'Add Room'}}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
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
export class RoomModalComponent implements OnInit {
  @Input() isOpen = false
  @Input() editMode = false
  @Input() roomToEdit: any = null
  @Input() hotels: Hotel[] = []

  @Output() close = new EventEmitter<void>()
  @Output() save = new EventEmitter<RoomFormData>()

  roomData: RoomFormData = this.getEmptyRoomData()
  isSaving = false
  errors: Record<string, string> = {}

  availableAmenities = [
    'Free WiFi', 'Air Conditioning', 'Flat-screen TV', 'Mini Bar',
    'Coffee Maker', 'Safe', 'Balcony', 'Ocean View', 'Mountain View',
    'City View', 'Kitchen', 'Kitchenette', 'Washer/Dryer', 'Jacuzzi',
    'Fireplace', 'Private Pool', 'Room Service', 'Desk'
  ]

  constructor() {}

  ngOnInit(): void {
    this.resetForm()
  }

  ngOnChanges(): void {
    if (this.isOpen) {
      if (this.editMode && this.roomToEdit) {
        this.roomData = { ...this.roomToEdit }
      } else {
        this.resetForm()
      }
    }
  }

  resetForm(): void {
    this.roomData = this.getEmptyRoomData()
    this.errors = {}
  }

  getEmptyRoomData(): RoomFormData {
    return {
      hotelId: 0,
      name: '',
      type: 'Standard',
      capacity: 2,
      price: 100,
      status: 'available',
      description: '',
      amenities: [],
      image: ''
    }
  }

  isAmenitySelected(amenity: string): boolean {
    return this.roomData.amenities?.includes(amenity) || false
  }

  toggleAmenity(amenity: string): void {
    if (!this.roomData.amenities) {
      this.roomData.amenities = []
    }

    if (this.isAmenitySelected(amenity)) {
      this.roomData.amenities = this.roomData.amenities.filter(a => a !== amenity)
    } else {
      this.roomData.amenities.push(amenity)
    }
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

  saveRoom(): void {
    if (this.validateForm()) {
      this.isSaving = true

      // Simulate API call
      setTimeout(() => {
        this.save.emit(this.roomData)
        this.isSaving = false
        this.closeModal()
      }, 1000)
    }
  }

  validateForm(): boolean {
    this.errors = {}
    let isValid = true

    if (!this.roomData.hotelId || this.roomData.hotelId === 0) {
      this.errors['hotelId'] = 'Please select a hotel'
      isValid = false
    }

    if (!this.roomData.name || this.roomData.name.trim() === '') {
      this.errors['name'] = 'Room name is required'
      isValid = false
    }

    if (!this.roomData.description || this.roomData.description.trim() === '') {
      this.errors['description'] = 'Description is required'
      isValid = false
    }

    if (!this.roomData.image || this.roomData.image.trim() === '') {
      this.errors['image'] = 'Image URL is required'
      isValid = false
    }

    if (!this.roomData.capacity || this.roomData.capacity <= 0) {
      this.errors['capacity'] = 'Capacity must be greater than 0'
      isValid = false
    }

    if (!this.roomData.price || this.roomData.price <= 0) {
      this.errors['price'] = 'Price must be greater than 0'
      isValid = false
    }

    return isValid
  }

  closeModal(): void {
    this.close.emit()
  }
}
