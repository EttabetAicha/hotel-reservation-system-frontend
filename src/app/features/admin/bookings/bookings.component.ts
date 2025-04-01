import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { ReservationService } from "../../../core/services/reservation.service"
import { Reservation, ReservationStatus } from "../../../core/models/reservation.interface"
import { Payment, PaymentStatus } from "../../../core/models/payment.interface"
import { forkJoin, map, Observable, of, switchMap } from "rxjs"

interface AdminBooking {
  id: string;
  guestName: string;
  guestEmail: string;
  hotelName: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  amount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  reservation: Reservation;}

@Component({
  selector: "app-admin-bookings",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bookings.component.html',
})
export class AdminBookingsComponent implements OnInit {
  bookings: AdminBooking[] = []
  filteredBookings: AdminBooking[] = []
  searchTerm = ""
  filterStatus = "all"
  isLoading = true
  currentPage = 1
  itemsPerPage = 10
  totalItems = 0

  constructor(private reservationService: ReservationService) {}

  ngOnInit(): void {
    this.loadReservations()
  }

  loadReservations(): void {
    this.isLoading = true
    this.reservationService.getAllReservations().pipe(
      switchMap(reservations => {
        if (reservations.length === 0) {
          this.isLoading = false
          return of([])
        }

        const bookingObservables = reservations.map(reservation => {
          return forkJoin({
            roomName: this.reservationService.getRoomNameById(reservation.roomId),
            hotelName: this.reservationService.getHotelNameByRoomId(reservation.roomId)
          }).pipe(
            map(({ roomName, hotelName }) => {
              // Map Reservation to AdminBooking
              return this.mapReservationToAdminBooking(reservation, roomName, hotelName)
            })
          )
        })

        return forkJoin(bookingObservables)
      })
    ).subscribe({
      next: (adminBookings) => {
        this.bookings = adminBookings
        this.totalItems = adminBookings.length
        this.filterBookings()
        this.isLoading = false
      },
      error: (error) => {
        console.error('Error loading reservations:', error)
        this.isLoading = false
      }
    })
  }

  mapReservationToAdminBooking(reservation: Reservation, roomName: string, hotelName: string): AdminBooking {
    // Default values for guest information
    let guestName = 'Guest'
    let guestEmail = 'N/A'

    // If payment information exists, use it for guest details
    if (reservation.payment) {
      guestName = reservation.payment.payerName
      guestEmail = reservation.payment.payerEmail
    }

    // Format dates
    const checkInDate = new Date(reservation.checkIn)
    const checkOutDate = new Date(reservation.checkOut)
    const formattedCheckIn = checkInDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    const formattedCheckOut = checkOutDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

    // Calculate number of guests (default to 2)
    const guests = 2

    // Map ReservationStatus to display status
    let displayStatus = reservation.status

    // Map PaymentStatus to display payment status
    let displayPaymentStatus = reservation.payment ? reservation.payment.paymentStatus : PaymentStatus.PENDING

    return {
      id: reservation.id || '',
      guestName,
      guestEmail,
      hotelName,
      roomName,
      checkIn: formattedCheckIn,
      checkOut: formattedCheckOut,
      guests,
      amount: reservation.totalPrice,
      status: displayStatus,
      paymentStatus: displayPaymentStatus,
      createdAt: reservation.createdAt ? reservation.createdAt.toString() : new Date().toISOString(),
      reservation
    }
  }

  filterBookings(): void {
    this.filteredBookings = this.bookings.filter((booking) => {
      const searchTermMatch =
        !this.searchTerm ||
        booking.guestName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        booking.guestEmail.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        booking.hotelName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        booking.roomName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        booking.id.toLowerCase().includes(this.searchTerm.toLowerCase())

      const statusMatch = this.filterStatus === "all" ||
        booking.status.toLowerCase() === this.filterStatus.toLowerCase()

      return searchTermMatch && statusMatch
    })
  }

  getStatusBadgeClass(status: string): string {
    switch (status.toUpperCase()) {
      case ReservationStatus.CONFIRMED:
        return "bg-green-100 text-green-800"
      case ReservationStatus.PENDING:
        return "bg-yellow-100 text-yellow-800"
      case ReservationStatus.CANCELLED:
        return "bg-red-100 text-red-800"
      case ReservationStatus.COMPLETED:
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  getPaymentStatusBadgeClass(status: string): string {
    switch (status.toUpperCase()) {
      case PaymentStatus.COMPLETED:
        return "bg-green-100 text-green-800"
      case PaymentStatus.PENDING:
        return "bg-yellow-100 text-yellow-800"
      case PaymentStatus.FAILED:
      case PaymentStatus.CANCELLED:
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  exportBookings(): void {
    // Implementation for exporting bookings
    console.log("Export bookings")

    // Create CSV content
    const headers = ['Booking ID', 'Guest Name', 'Guest Email', 'Hotel', 'Room', 'Check In', 'Check Out', 'Guests', 'Amount', 'Status', 'Payment Status']
    const csvContent = [
      headers.join(','),
      ...this.filteredBookings.map(booking => [
        booking.id,
        `"${booking.guestName}"`,
        `"${booking.guestEmail}"`,
        `"${booking.hotelName}"`,
        `"${booking.roomName}"`,
        booking.checkIn,
        booking.checkOut,
        booking.guests,
        booking.amount,
        booking.status,
        booking.paymentStatus
      ].join(','))
    ].join('\n')

    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `bookings-export-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  viewBookingDetails(id: string): void {
    // Implementation for viewing booking details
    console.log("View booking details", id)
  }

  editBooking(booking: AdminBooking): void {
    // Implementation for editing booking
    console.log("Edit booking", booking)
  }

  cancelBooking(id: string): void {
    // Find the booking to cancel
    const bookingToCancel = this.bookings.find(b => b.id === id)
    if (!bookingToCancel || !bookingToCancel.reservation.id) {
      console.error('Booking not found or has no ID')
      return
    }

    // Update the reservation status to CANCELLED
    const updatedReservation: Reservation = {
      ...bookingToCancel.reservation,
      status: ReservationStatus.CANCELLED
    }

    // If there's a payment, update its status too
    if (updatedReservation.payment) {
      updatedReservation.payment = {
        ...updatedReservation.payment,
        paymentStatus: PaymentStatus.CANCELLED
      }
    }

    // Call the service to update the reservation
    this.reservationService.updateReservation(bookingToCancel.reservation.id, updatedReservation)
      .subscribe({
        next: () => {
          console.log("Booking cancelled successfully")
          // Update the local booking status
          bookingToCancel.status = ReservationStatus.CANCELLED
          if (bookingToCancel.reservation.payment) {
            bookingToCancel.paymentStatus = PaymentStatus.CANCELLED
          }
          // Refresh the filtered bookings
          this.filterBookings()
        },
        error: (error) => {
          console.error("Error cancelling booking:", error)
        }
      })
  }

  // Pagination methods
  get paginatedBookings(): AdminBooking[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage
    return this.filteredBookings.slice(startIndex, startIndex + this.itemsPerPage)
  }

  get totalPages(): number {
    return Math.ceil(this.filteredBookings.length / this.itemsPerPage)
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--
    }
  }
  get currentPageItemCount(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.filteredBookings.length);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++
    }
  }
}