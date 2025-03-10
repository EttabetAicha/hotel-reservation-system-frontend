import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"

interface Booking {
  id: string
  guestName: string
  guestEmail: string
  hotelName: string
  roomName: string
  checkIn: string
  checkOut: string
  guests: number
  amount: number
  status: "confirmed" | "pending" | "cancelled" | "completed"
  paymentStatus: "paid" | "pending" | "refunded"
  createdAt: string
}

@Component({
  selector: "app-admin-bookings",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl:'./bookings.component.html' ,
})
export class AdminBookingsComponent implements OnInit {
  bookings: Booking[] = []
  filteredBookings: Booking[] = []
  searchTerm = ""
  filterStatus = "all"

  constructor() {}

  ngOnInit(): void {
    // Fetch bookings data
    this.bookings = this.generateMockBookings()
    this.filterBookings()
  }

  filterBookings(): void {
    this.filteredBookings = this.bookings.filter((booking) => {
      const searchTermMatch =
        !this.searchTerm ||
        booking.guestName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        booking.guestEmail.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        booking.hotelName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        booking.roomName.toLowerCase().includes(this.searchTerm.toLowerCase())

      const statusMatch = this.filterStatus === "all" || booking.status === this.filterStatus

      return searchTermMatch && statusMatch
    })
  }

  generateMockBookings(): Booking[] {
    return [
      {
        id: "BK-12345",
        guestName: "John Smith",
        guestEmail: "john.smith@example.com",
        hotelName: "Grand Plaza Hotel",
        roomName: "Deluxe King Room",
        checkIn: "Oct 15, 2023",
        checkOut: "Oct 18, 2023",
        guests: 2,
        amount: 750,
        status: "confirmed",
        paymentStatus: "paid",
        createdAt: "2023-09-20",
      },
      {
        id: "BK-12346",
        guestName: "Sarah Johnson",
        guestEmail: "sarah.j@example.com",
        hotelName: "Seaside Resort",
        roomName: "Ocean View Room",
        checkIn: "Oct 20, 2023",
        checkOut: "Oct 25, 2023",
        guests: 2,
        amount: 1600,
        status: "pending",
        paymentStatus: "pending",
        createdAt: "2023-09-22",
      },
      {
        id: "BK-12347",
        guestName: "Michael Brown",
        guestEmail: "mbrown@example.com",
        hotelName: "Urban Loft Suites",
        roomName: "Studio Apartment",
        checkIn: "Oct 10, 2023",
        checkOut: "Oct 12, 2023",
        guests: 1,
        amount: 360,
        status: "cancelled",
        paymentStatus: "refunded",
        createdAt: "2023-09-15",
      },
      {
        id: "BK-12348",
        guestName: "Emily Davis",
        guestEmail: "emily.davis@example.com",
        hotelName: "Mountain View Lodge",
        roomName: "Cabin Room",
        checkIn: "Oct 22, 2023",
        checkOut: "Oct 26, 2023",
        guests: 4,
        amount: 880,
        status: "confirmed",
        paymentStatus: "paid",
        createdAt: "2023-09-25",
      },
      {
        id: "BK-12349",
        guestName: "David Wilson",
        guestEmail: "dwilson@example.com",
        hotelName: "Grand Plaza Hotel",
        roomName: "Executive Suite",
        checkIn: "Oct 18, 2023",
        checkOut: "Oct 21, 2023",
        guests: 2,
        amount: 1350,
        status: "confirmed",
        paymentStatus: "paid",
        createdAt: "2023-09-21",
      },
      {
        id: "BK-12350",
        guestName: "Jennifer Lee",
        guestEmail: "jlee@example.com",
        hotelName: "Seaside Resort",
        roomName: "Family Suite",
        checkIn: "Nov 5, 2023",
        checkOut: "Nov 10, 2023",
        guests: 5,
        amount: 2750,
        status: "confirmed",
        paymentStatus: "paid",
        createdAt: "2023-09-28",
      },
      {
        id: "BK-12351",
        guestName: "Robert Taylor",
        guestEmail: "rtaylor@example.com",
        hotelName: "Urban Loft Suites",
        roomName: "Penthouse Suite",
        checkIn: "Oct 25, 2023",
        checkOut: "Oct 28, 2023",
        guests: 2,
        amount: 1950,
        status: "pending",
        paymentStatus: "pending",
        createdAt: "2023-09-26",
      },
      {
        id: "BK-12352",
        guestName: "Lisa Anderson",
        guestEmail: "lisa.a@example.com",
        hotelName: "Mountain View Lodge",
        roomName: "Luxury Chalet",
        checkIn: "Dec 20, 2023",
        checkOut: "Dec 27, 2023",
        guests: 6,
        amount: 5950,
        status: "confirmed",
        paymentStatus: "paid",
        createdAt: "2023-09-30",
      },
    ]
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  getPaymentStatusBadgeClass(status: string): string {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "refunded":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  exportBookings(): void {
    // Implementation for exporting bookings
    console.log("Export bookings")
  }

  viewBookingDetails(id: string): void {
    // Implementation for viewing booking details
    console.log("View booking details", id)
  }

  editBooking(booking: Booking): void {
    // Implementation for editing booking
    console.log("Edit booking", booking)
  }

  cancelBooking(id: string): void {
    // Implementation for cancelling booking
    console.log("Cancel booking", id)
  }
}

