import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { Router, RouterLink } from "@angular/router"
import { NavbarComponent } from "../navbar/navbar.component"
import { FooterComponent } from "../footer/footer.component"
import { BookingService, type Booking } from "../../../core/services/booking.service"
import { trigger, transition, style, animate, query, stagger } from "@angular/animations"

@Component({
  selector: "app-bookings",
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent,RouterLink],
  animations: [
    trigger("fadeIn", [transition(":enter", [style({ opacity: 0 }), animate("400ms ease-in", style({ opacity: 1 }))])]),
    trigger("staggerList", [
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
    trigger("slideInUp", [
      transition(":enter", [
        style({ transform: "translateY(30px)", opacity: 0 }),
        animate("500ms ease-out", style({ transform: "translateY(0)", opacity: 1 })),
      ]),
    ]),
  ],
  templateUrl: "./booking.component.html",
})
export class BookingsComponent implements OnInit {
  bookings: Booking[] = []
  filteredBookings: Booking[] = []
  isLoading = true
  activeFilter: "all" | "upcoming" | "completed" | "cancelled" = "all"
  showCancelModal = false
  bookingToCancel: Booking | null = null
  isCancelling = false

  constructor(
    private bookingService: BookingService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadBookings()
  }

  loadBookings(): void {
    this.isLoading = true
    this.bookingService.getBookings().subscribe((bookings) => {
      this.bookings = bookings
      this.filterBookings(this.activeFilter)
      this.isLoading = false
    })
  }

  filterBookings(filter: "all" | "upcoming" | "completed" | "cancelled"): void {
    this.activeFilter = filter

    if (filter === "all") {
      this.filteredBookings = [...this.bookings]
    } else {
      this.filteredBookings = this.bookings.filter((booking) => booking.status === filter)
    }
  }

  viewBookingDetails(bookingId: string): void {
    // Navigate to booking details page
    this.router.navigate(["/booking-details", bookingId])
  }

  viewHotel(hotelId: number): void {
    this.router.navigate(["/hotel-details", hotelId])
  }

  confirmCancellation(booking: Booking): void {
    this.bookingToCancel = booking
    this.showCancelModal = true
  }

  cancelBooking(): void {
    if (!this.bookingToCancel) return

    this.isCancelling = true
    this.bookingService.cancelBooking(this.bookingToCancel.id).subscribe((success) => {
      this.isCancelling = false
      this.showCancelModal = false

      if (success) {
        // Reload bookings to reflect the cancellation
        this.loadBookings()
      }
    })
  }

  closeCancelModal(): void {
    this.showCancelModal = false
    this.bookingToCancel = null
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

