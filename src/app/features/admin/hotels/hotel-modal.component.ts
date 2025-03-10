import { Component, Input, Output, EventEmitter, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"

export interface RoomData {
  id?: number
  name: string
  type: string
  capacity: number
  price: number
  description: string
  image: string
  status?: "available" | "occupied" | "maintenance" | "reserved"
}

export interface HotelFormData {
  id?: number
  name: string
  location: string
  description: string
  stars: number
  image: string
  amenities: string[]
  status: "active" | "maintenance" | "closed"
  rooms: RoomData[]
}

@Component({
  selector: "app-hotel-modal",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template:`
  <div *ngIf="isOpen" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
  <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
       [class.animate-fadeIn]="isOpen"
       (click)="$event.stopPropagation()">
    <!-- Header -->
    <div class="p-6 border-b border-gray-200">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-gray-800">{{editMode ? 'Edit Hotel' : 'Add New Hotel'}}</h2>
        <button (click)="closeModal()" class="text-gray-500 hover:text-gray-700 transition-colors duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex border-b border-gray-200">
      <button
        type="button"
        class="px-6 py-3 font-medium text-sm"
        [class.tab-active]="activeTab === 'details'"
        (click)="setActiveTab('details')"
      >
        Hotel Details
      </button>
      <button
        type="button"
        class="px-6 py-3 font-medium text-sm"
        [class.tab-active]="activeTab === 'rooms'"
        (click)="setActiveTab('rooms')"
      >
        Rooms
      </button>
    </div>

    <!-- Body -->
    <div class="p-6">
      <form (ngSubmit)="saveHotel()">
        <!-- Hotel Details Tab -->
        <div *ngIf="activeTab === 'details'">
          <!-- Basic Information -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="hotel-name" class="block text-sm font-medium text-gray-700 mb-1">Hotel Name*</label>
                <input
                  type="text"
                  id="hotel-name"
                  name="name"
                  [(ngModel)]="hotelData.name"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                <div *ngIf="errors['name']" class="mt-1 text-sm text-red-600">{{errors['name']}}</div>
              </div>

              <div>
                <label for="hotel-location" class="block text-sm font-medium text-gray-700 mb-1">Location*</label>
                <input
                  type="text"
                  id="hotel-location"
                  name="location"
                  [(ngModel)]="hotelData.location"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                <div *ngIf="errors['location']" class="mt-1 text-sm text-red-600">{{errors['location']}}</div>
              </div>
            </div>
          </div>

          <!-- Description -->
          <div class="mb-6">
            <label for="hotel-description" class="block text-sm font-medium text-gray-700 mb-1">Description*</label>
            <textarea
              id="hotel-description"
              name="description"
              [(ngModel)]="hotelData.description"
              rows="4"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            ></textarea>
            <div *ngIf="errors['description']" class="mt-1 text-sm text-red-600">{{errors['description']}}</div>
          </div>

          <!-- Image and Stars -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label for="hotel-image" class="block text-sm font-medium text-gray-700 mb-1">Image URL*</label>
              <input
                type="text"
                id="hotel-image"
                name="image"
                [(ngModel)]="hotelData.image"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
              <div *ngIf="errors['image']" class="mt-1 text-sm text-red-600">{{errors['image']}}</div>
            </div>

            <div>
              <label for="hotel-stars" class="block text-sm font-medium text-gray-700 mb-1">Star Rating*</label>
              <select
                id="hotel-stars"
                name="stars"
                [(ngModel)]="hotelData.stars"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option [ngValue]="1">1 Star</option>
                <option [ngValue]="2">2 Stars</option>
                <option [ngValue]="3">3 Stars</option>
                <option [ngValue]="4">4 Stars</option>
                <option [ngValue]="5">5 Stars</option>
              </select>
              <div *ngIf="errors['stars']" class="mt-1 text-sm text-red-600">{{errors['stars']}}</div>
            </div>
          </div>

          <!-- Status -->
          <div class="mb-6">
            <label for="hotel-status" class="block text-sm font-medium text-gray-700 mb-1">Status*</label>
            <select
              id="hotel-status"
              name="status"
              [(ngModel)]="hotelData.status"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="closed">Closed</option>
            </select>
            <div *ngIf="errors['status']" class="mt-1 text-sm text-red-600">{{errors['status']}}</div>
          </div>

          <!-- Amenities -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div *ngFor="let amenity of availableAmenities" class="flex items-center">
                <input
                  type="checkbox"
                  [id]="'amenity-' + amenity"
                  [checked]="isAmenitySelected(amenity)"
                  (change)="toggleAmenity(amenity)"
                  class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                >
                <label [for]="'amenity-' + amenity" class="ml-2 block text-sm text-gray-700">
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
                    [src]="hotelData.image || 'https://via.placeholder.com/400x300?text=Hotel+Image'"
                    alt="Hotel preview"
                    class="w-full h-48 object-cover rounded-lg"
                  >
                </div>
                <div class="md:w-2/3">
                  <h4 class="text-xl font-bold text-gray-800">{{hotelData.name || 'Hotel Name'}}</h4>
                  <div class="flex items-center mt-1 mb-2">
                    <div class="flex">
                      <ng-container *ngFor="let i of [1, 2, 3, 4, 5]">
                        <svg
                          *ngIf="i <= hotelData.stars"
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-5 w-5 text-yellow-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </ng-container>
                    </div>
                    <span class="ml-2 text-gray-600">{{hotelData.location || 'Location'}}</span>
                  </div>
                  <p class="text-gray-700">{{hotelData.description || 'Hotel description will appear here.'}}</p>
                  <div class="mt-2">
                    <span
                      [class]="getStatusBadgeClass(hotelData.status)"
                      class="px-2 py-1 text-xs font-bold rounded-full uppercase"
                    >
                      {{hotelData.status}}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Rooms Tab -->
        <div *ngIf="activeTab === 'rooms'">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-gray-800">Rooms</h3>
            <button
              type="button"
              (click)="addRoom()"
              class="flex items-center gap-1 px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Room
            </button>
          </div>

          <div *ngIf="!hotelData.rooms || hotelData.rooms.length === 0" class="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p class="text-gray-500">No rooms added yet. Click "Add Room" to associate rooms with this hotel.</p>
          </div>

          <div *ngIf="hotelData.rooms && hotelData.rooms.length > 0" class="space-y-4">
            <div *ngFor="let room of hotelData.rooms; let i = index" class="border rounded-lg p-4 relative">
              <button
                type="button"
                class="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                (click)="removeRoom(i)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label [for]="'room-' + i + '-name'" class="block text-sm font-medium text-gray-700 mb-1">Room Name*</label>
                  <input
                    [id]="'room-' + i + '-name'"
                    [(ngModel)]="room.name"
                    [name]="'room-' + i + '-name'"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                  <div *ngIf="errors['room-' + i + '-name']" class="mt-1 text-sm text-red-600">{{errors['room-' + i + '-name']}}</div>
                </div>
                <div>
                  <label [for]="'room-' + i + '-type'" class="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                  <select
                    [id]="'room-' + i + '-type'"
                    [(ngModel)]="room.type"
                    [name]="'room-' + i + '-type'"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option *ngFor="let type of roomTypes" [value]="type">{{type}}</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label [for]="'room-' + i + '-capacity'" class="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                  <input
                    [id]="'room-' + i + '-capacity'"
                    [(ngModel)]="room.capacity"
                    [name]="'room-' + i + '-capacity'"
                    type="number"
                    min="1"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                </div>
                <div>
                  <label [for]="'room-' + i + '-price'" class="block text-sm font-medium text-gray-700 mb-1">Price per Night*</label>
                  <input
                    [id]="'room-' + i + '-price'"
                    [(ngModel)]="room.price"
                    [name]="'room-' + i + '-price'"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                  <div *ngIf="errors['room-' + i + '-price']" class="mt-1 text-sm text-red-600">{{errors['room-' + i + '-price']}}</div>
                </div>
              </div>

              <div class="mb-4">
                <label [for]="'room-' + i + '-description'" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  [id]="'room-' + i + '-description'"
                  [(ngModel)]="room.description"
                  [name]="'room-' + i + '-description'"
                  rows="2"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div class="mb-4">
                <label [for]="'room-' + i + '-image'" class="block text-sm font-medium text-gray-700 mb-1">Image URL*</label>
                <input
                  [id]="'room-' + i + '-image'"
                  [(ngModel)]="room.image"
                  [name]="'room-' + i + '-image'"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                <div *ngIf="errors['room-' + i + '-image']" class="mt-1 text-sm text-red-600">{{errors['room-' + i + '-image']}}</div>
              </div>

              <div class="mb-4">
                <label [for]="'room-' + i + '-status'" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  [id]="'room-' + i + '-status'"
                  [(ngModel)]="room.status"
                  [name]="'room-' + i + '-status'"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="reserved">Reserved</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div *ngIf="room.image" class="mt-4">
                <img
                  [src]="room.image"
                  [alt]="room.name"
                  class="h-32 w-full object-cover rounded-md"
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end space-x-4 mt-6">
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
              Deleting...
            </span>
            <span *ngIf="!isSaving">{{editMode ? 'Update Hotel' : 'Add Hotel'}}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</div>

` ,
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
export class HotelModalComponent implements OnInit {
  @Input() isOpen = false
  @Input() editMode = false
  @Input() hotelToEdit: any = null

  @Output() close = new EventEmitter<void>()
  @Output() save = new EventEmitter<HotelFormData>()

  hotelData: HotelFormData = this.getEmptyHotelData()
  isSaving = false
  errors: Record<string, string> = {}
  activeTab: "details" | "rooms" = "details"

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
  ]

  roomTypes = ["Single", "Double", "Twin", "Suite", "Deluxe", "Executive", "Family", "Presidential", "Studio"]

  constructor() {}

  ngOnInit(): void {
    this.resetForm()
  }

  ngOnChanges(): void {
    if (this.isOpen) {
      if (this.editMode && this.hotelToEdit) {
        // Make a deep copy of the hotel data to avoid reference issues
        this.hotelData = {
          ...this.hotelToEdit,
          // Ensure stars is a number
          stars: Number(this.hotelToEdit.stars),
          // Ensure rooms is an array and make a deep copy
          rooms: Array.isArray(this.hotelToEdit.rooms) ? this.hotelToEdit.rooms.map((room: RoomData) => ({ ...room })) : [],
        }

        // Ensure amenities is an array
        if (!Array.isArray(this.hotelData.amenities)) {
          this.hotelData.amenities = []
        }
      } else {
        this.resetForm()
      }
    }
  }

  resetForm(): void {
    this.hotelData = this.getEmptyHotelData()
    this.errors = {}
    this.activeTab = "details"
  }

  getEmptyHotelData(): HotelFormData {
    return {
      name: "",
      location: "",
      description: "",
      stars: 3,
      image: "",
      amenities: [],
      status: "active",
      rooms: [],
    }
  }

  getEmptyRoomData(): RoomData {
    return {
      name: "",
      type: "Single",
      capacity: 2,
      price: 0,
      description: "",
      image: "",
      status: "available",
    }
  }

  isAmenitySelected(amenity: string): boolean {
    return this.hotelData.amenities?.includes(amenity) || false
  }

  toggleAmenity(amenity: string): void {
    if (!this.hotelData.amenities) {
      this.hotelData.amenities = []
    }

    if (this.isAmenitySelected(amenity)) {
      this.hotelData.amenities = this.hotelData.amenities.filter((a) => a !== amenity)
    } else {
      this.hotelData.amenities.push(amenity)
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "maintenance":
        return "bg-yellow-100 text-yellow-800"
      case "closed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  getRoomStatusBadgeClass(status: string): string {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800"
      case "occupied":
        return "bg-blue-100 text-blue-800"
      case "reserved":
        return "bg-yellow-100 text-yellow-800"
      case "maintenance":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  addRoom(): void {
    // Create a new room and add it to the rooms array
    const newRoom = this.getEmptyRoomData()
    if (!this.hotelData.rooms) {
      this.hotelData.rooms = []
    }
    this.hotelData.rooms.push(newRoom)
  }

  removeRoom(index: number): void {
    if (this.hotelData.rooms && index >= 0 && index < this.hotelData.rooms.length) {
      this.hotelData.rooms.splice(index, 1)
    }
  }

  saveHotel(): void {
    if (this.validateForm()) {
      this.isSaving = true

      // Ensure stars is a number
      this.hotelData.stars = Number(this.hotelData.stars)

      // Ensure rooms data is properly formatted
      if (!this.hotelData.rooms) {
        this.hotelData.rooms = []
      }

      // Format room data
      this.hotelData.rooms = this.hotelData.rooms.map((room) => ({
        ...room,
        capacity: Number(room.capacity),
        price: Number(room.price),
      }))

      // Create a deep copy of the data to avoid reference issues
      const hotelDataCopy: HotelFormData = JSON.parse(JSON.stringify(this.hotelData))

      // Simulate API call
      setTimeout(() => {
        this.save.emit(hotelDataCopy)
        this.isSaving = false
        this.closeModal()
      }, 1000)
    }
  }

  validateForm(): boolean {
    this.errors = {}
    let isValid = true

    if (!this.hotelData.name || this.hotelData.name.trim() === "") {
      this.errors["name"] = "Hotel name is required"
      isValid = false
    }

    if (!this.hotelData.location || this.hotelData.location.trim() === "") {
      this.errors["location"] = "Location is required"
      isValid = false
    }

    if (!this.hotelData.description || this.hotelData.description.trim() === "") {
      this.errors["description"] = "Description is required"
      isValid = false
    }

    if (!this.hotelData.image || this.hotelData.image.trim() === "") {
      this.errors["image"] = "Image URL is required"
      isValid = false
    }

    // Validate rooms if there are any
    if (this.hotelData.rooms && this.hotelData.rooms.length > 0) {
      this.hotelData.rooms.forEach((room, index) => {
        if (!room.name || room.name.trim() === "") {
          this.errors[`room-${index}-name`] = "Room name is required"
          isValid = false
        }
        if (!room.image || room.image.trim() === "") {
          this.errors[`room-${index}-image`] = "Room image URL is required"
          isValid = false
        }
        if (!room.price || room.price <= 0) {
          this.errors[`room-${index}-price`] = "Price must be greater than 0"
          isValid = false
        }
      })
    }

    return isValid
  }

  closeModal(): void {
    this.close.emit()
  }

  setActiveTab(tab: "details" | "rooms"): void {
    this.activeTab = tab
  }

  // Debug method to check data before saving
  logFormData(): void {
    console.log("Current hotel data:", JSON.stringify(this.hotelData, null, 2))
  }
}

