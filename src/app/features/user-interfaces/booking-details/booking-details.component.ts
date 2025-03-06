import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ActivatedRoute, Router } from "@angular/router"

import { NavbarComponent } from "../navbar/navbar.component"
import { FooterComponent } from "../footer/footer.component"
import { BookingService, type Booking } from "../../../core/services/booking.service"
import { trigger, transition, style, animate } from "@angular/animations"

@Component({
  selector: "app-booking-details",
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent],
  animations: [
    trigger("fadeIn", [transition(":enter", [style({ opacity: 0 }), animate("400ms ease-in", style({ opacity: 1 }))])]),
    trigger("slideInUp", [
      transition(":enter", [
        style({ transform: "translateY(30px)", opacity: 0 }),
        animate("500ms ease-out", style({ transform: "translateY(0)", opacity: 1 })),
      ]),
    ]),
  ],
  templateUrl: "./booking-details.component.html",
})
export class BookingDetailsComponent implements OnInit {
  booking: Booking | null = null
  isLoading = true
  showCancelModal = false
  isCancelling = false

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const bookingId = params.get("id")
      if (bookingId) {
        this.loadBookingDetails(bookingId)
      } else {
        this.router.navigate(["/bookings"])
      }
    })
  }

  loadBookingDetails(bookingId: string): void {
    this.isLoading = true
    this.bookingService.getBookingById(bookingId).subscribe((booking) => {
      this.booking = booking || null
      this.isLoading = false

      if (!booking) {
        // Booking not found, redirect to bookings list
        this.router.navigate(["/bookings"])
      }
    })
  }

  viewHotel(hotelId: number): void {
    this.router.navigate(["/hotel-details", hotelId])
  }

  confirmCancellation(): void {
    this.showCancelModal = true
  }

  cancelBooking(): void {
    if (!this.booking) return

    this.isCancelling = true
    this.bookingService.cancelBooking(this.booking.id).subscribe((success) => {
      this.isCancelling = false
      this.showCancelModal = false

      if (success) {
        // Reload booking details to reflect the cancellation
        this.loadBookingDetails(this.booking!.id)
      }
    })
  }

  closeCancelModal(): void {
    this.showCancelModal = false
  }

  getStatusClass(status: string): string {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  calculateNights(checkIn: string, checkOut: string): number {
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays || 1
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }
}

