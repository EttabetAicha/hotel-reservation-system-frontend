import { Component, EventEmitter, Input, type OnInit, Output } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { trigger, transition, style, animate } from "@angular/animations"

interface FilterOptions {
  priceRange: [number, number]
  stars: number[]
  amenities: string[]
  distance?: string
}

@Component({
  selector: "app-filter-sidebar",
  standalone: true,
  imports: [CommonModule, FormsModule],
  animations: [
    trigger("fadeIn", [
      transition(":enter", [
        style({ opacity: 0, transform: "translateY(10px)" }),
        animate("300ms ease-out", style({ opacity: 1, transform: "translateY(0)" })),
      ]),
    ]),
    trigger("expandCollapse", [
      transition(":enter", [
        style({ height: 0, opacity: 0 }),
        animate("300ms ease-out", style({ height: "*", opacity: 1 })),
      ]),
      transition(":leave", [animate("300ms ease-in", style({ height: 0, opacity: 0 }))]),
    ]),
  ],
  template: `
    <div class="bg-white rounded-xl shadow-lg p-5 border border-gray-100" @fadeIn>
      <h3 class="text-lg font-bold mb-5 text-gray-800">Filters</h3>

      <!-- Price Range -->
      <div class="mb-6">
        <h4 class="font-medium mb-3 text-gray-700">Price Range</h4>
        <div class="flex justify-between mb-2">
          <span>{{ priceRange[0] }}</span>
          <span>{{ priceRange[1] }}</span>
        </div>
        <div class="relative">
          <div class="w-full h-2 bg-gray-200 rounded-lg absolute top-0"></div>
          <div
            class="h-2 bg-indigo-600 rounded-lg absolute top-0"
            [style.left.%]="(priceRange[0] / 1000) * 100"
            [style.width.%]="((priceRange[1] - priceRange[0]) / 1000) * 100"
          ></div>
          <input
            type="range"
            min="0"
            max="1000"
            step="10"
            [(ngModel)]="priceRange[0]"
            (ngModelChange)="updatePriceRange()"
            class="w-full h-2 bg-transparent appearance-none cursor-pointer absolute top-0 z-10"
          />
          <input
            type="range"
            min="0"
            max="1000"
            step="10"
            [(ngModel)]="priceRange[1]"
            (ngModelChange)="updatePriceRange()"
            class="w-full h-2 bg-transparent appearance-none cursor-pointer absolute top-0 z-10"
          />
        </div>
        <div class="flex gap-2 mt-6">
          <div class="flex-1">
            <input
              type="number"
              [(ngModel)]="priceRange[0]"
              (ngModelChange)="updatePriceRange()"
              min="0"
              max="1000"
              class="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div class="flex-1">
            <input
              type="number"
              [(ngModel)]="priceRange[1]"
              (ngModelChange)="updatePriceRange()"
              min="0"
              max="1000"
              class="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      <!-- Star Rating -->
      <div class="mb-6">
        <h4 class="font-medium mb-3 text-gray-700">Star Rating</h4>
        <div class="space-y-2">
          <div
            *ngFor="let star of [5, 4, 3, 2, 1]"
            class="flex items-center"
          >
            <input
              type="checkbox"
              [id]="'star-' + star"
              [checked]="isStarSelected(star)"
              (change)="toggleStar(star)"
              class="mr-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label [for]="'star-' + star" class="flex items-center cursor-pointer">
              <ng-container *ngFor="let i of [1, 2, 3, 4, 5]">
                <svg
                  *ngIf="i <= star"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 text-amber-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg
                  *ngIf="i > star"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 text-gray-300"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </ng-container>
            </label>
          </div>
        </div>
      </div>

      <!-- Amenities -->
      <div class="mb-6">
        <div class="flex justify-between items-center mb-3">
          <h4 class="font-medium text-gray-700">Amenities</h4>
          <button
            (click)="showAllAmenities = !showAllAmenities"
            class="text-sm text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
          >
            {{ showAllAmenities ? 'Show less' : 'Show all' }}
          </button>
        </div>
        <div class="space-y-2">
          <div
            *ngFor="let amenity of showAllAmenities ? availableAmenities : availableAmenities.slice(0, 5); let i = index"
            class="flex items-center"
            @fadeIn
          >
            <input
              type="checkbox"
              [id]="'amenity-' + amenity.replace(' ', '-')"
              [checked]="isAmenitySelected(amenity)"
              (change)="toggleAmenity(amenity)"
              class="mr-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label [for]="'amenity-' + amenity.replace(' ', '-')" class="cursor-pointer text-gray-700">
              {{ amenity }}
            </label>
          </div>
          <div *ngIf="!showAllAmenities && availableAmenities.length > 5" @expandCollapse>
            <button
              (click)="showAllAmenities = true"
              class="text-sm text-indigo-600 hover:text-indigo-800 transition-colors duration-200 mt-2"
            >
              + {{ availableAmenities.length - 5 }} more amenities
            </button>
          </div>
        </div>
      </div>

      <!-- Distance -->
      <div class="mb-6">
        <h4 class="font-medium mb-3 text-gray-700">Distance from Center</h4>
        <div class="space-y-2">
          <div *ngFor="let option of distanceOptions" class="flex items-center">
            <input
              type="radio"
              name="distance"
              [id]="'distance-' + option.value"
              [value]="option.value"
              [(ngModel)]="selectedDistance"
              (ngModelChange)="updateDistance()"
              class="mr-2 h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label [for]="'distance-' + option.value" class="cursor-pointer text-gray-700">
              {{ option.label }}
            </label>
          </div>
        </div>
      </div>

      <button
        (click)="resetFilters()"
        class="w-full py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors duration-300"
      >
        Reset Filters
      </button>
    </div>
  `,
})
export class FilterSidebarComponent implements OnInit {
  @Input() filterOptions!: FilterOptions
  @Output() filterChange = new EventEmitter<FilterOptions>()

  priceRange: [number, number] = [0, 1000]
  selectedStars: number[] = []
  selectedAmenities: string[] = []
  selectedDistance = "any"
  showAllAmenities = false

  availableAmenities: string[] = [
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
    "Beachfront",
    "Mountain View",
    "Breakfast Included",
    "Business Center",
    "Concierge Service",
  ]

  distanceOptions = [
    { value: "any", label: "Any distance" },
    { value: "less-than-1", label: "Less than 1 km" },
    { value: "1-to-3", label: "Between 1 and 3 km" },
    { value: "3-to-5", label: "Between 3 and 5 km" },
    { value: "more-than-5", label: "More than 5 km" },
  ]

  ngOnInit() {
    this.priceRange = [...this.filterOptions.priceRange]
    this.selectedStars = [...this.filterOptions.stars]
    this.selectedAmenities = [...this.filterOptions.amenities]
    this.selectedDistance = this.filterOptions.distance || "any"
  }

  updatePriceRange() {
    // Ensure min is always less than max
    if (this.priceRange[0] > this.priceRange[1]) {
      this.priceRange[0] = this.priceRange[1]
    }

    this.emitFilterChange()
  }

  isStarSelected(star: number): boolean {
    return this.selectedStars.includes(star)
  }

  toggleStar(star: number) {
    if (this.isStarSelected(star)) {
      this.selectedStars = this.selectedStars.filter((s) => s !== star)
    } else {
      this.selectedStars.push(star)
    }

    this.emitFilterChange()
  }

  isAmenitySelected(amenity: string): boolean {
    return this.selectedAmenities.includes(amenity)
  }

  toggleAmenity(amenity: string) {
    if (this.isAmenitySelected(amenity)) {
      this.selectedAmenities = this.selectedAmenities.filter((a) => a !== amenity)
    } else {
      this.selectedAmenities.push(amenity)
    }

    this.emitFilterChange()
  }

  updateDistance() {
    this.emitFilterChange()
  }

  resetFilters() {
    this.priceRange = [0, 1000]
    this.selectedStars = []
    this.selectedAmenities = []
    this.selectedDistance = "any"
    this.showAllAmenities = false

    this.emitFilterChange()
  }

  emitFilterChange() {
    this.filterChange.emit({
      priceRange: this.priceRange,
      stars: this.selectedStars,
      amenities: this.selectedAmenities,
      distance: this.selectedDistance,
    })
  }
}

