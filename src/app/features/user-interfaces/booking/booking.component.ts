import { Room } from './../../../core/models/room.interface';
import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { Router, RouterLink } from "@angular/router"
import { NavbarComponent } from "../navbar/navbar.component"
import { FooterComponent } from "../footer/footer.component"
import { ReservationService } from "../../../core/services/reservation.service"
import { Reservation, ReservationStatus } from "../../../core/models/reservation.interface"
import { Payment, PaymentStatus } from "../../../core/models/payment.interface"
import { trigger, transition, style, animate, query, stagger } from "@angular/animations"
import { catchError, forkJoin, map, of } from 'rxjs';

interface Booking {
  id: string;
  hotelId: number;
  hotelName: string;
  hotelImage: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  status: "upcoming" | "completed" | "cancelled";
  bookingDate: string;
  payment?: Payment;
}

@Component({
  selector: "app-bookings",
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent, RouterLink],
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
    private reservationService: ReservationService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadBookings()
  }
  private mapReservationToBooking(reservation: Reservation): Booking {
    // Map ReservationStatus to Booking status
    let bookingStatus: "upcoming" | "completed" | "cancelled";
    switch (reservation.status) {
      case ReservationStatus.PENDING:
      case ReservationStatus.CONFIRMED:
        bookingStatus = "upcoming";
        break;
      case ReservationStatus.COMPLETED:
        bookingStatus = "completed";
        break;
      case ReservationStatus.CANCELLED:
        bookingStatus = "cancelled";
        break;
      default:
        bookingStatus = "upcoming";
    }

    return {

      id: reservation.id || '',
      hotelId: parseInt(reservation.roomId) || 1,
      hotelName: 'Loading...', // Placeholder until actual value is fetched
      hotelImage: 'assets/default-image.jpg', // Placeholder image
      roomName: 'Loading...', // Placeholder until actual value is fetched
      checkIn: reservation.checkIn,
      checkOut: reservation.checkOut,
      guests: 2, // Default value
      totalAmount: reservation.totalPrice,
      status: bookingStatus,
      bookingDate: reservation.createdAt ? reservation.createdAt.toString() : new Date().toString(),
      payment: reservation.payment
    };
  }

  loadBookings(): void {
    this.isLoading = true;
    this.reservationService.getAllReservations().subscribe({
      next: (reservations) => {
        // Map initial bookings
        const bookings: Booking[] = reservations.map((reservation) =>
          this.mapReservationToBooking(reservation)
        );

        // Create an array of observables for additional details
        const detailObservables = bookings.map((booking, index) => {
          const roomId = reservations[index].roomId;
        
            return forkJoin({
            hotelName: this.reservationService.getHotelNameByRoomId(roomId),
            hotelImage: this.reservationService.getHotelImagesByRoomId(roomId),
            roomName: this.reservationService.getRoomNameById(roomId)
            }).pipe(
            map(details => {
              let parsedImage = 'assets/default-hotel.jpg';
              try {
                if (details.hotelImage && typeof details.hotelImage === 'string') {
                  try {
                    const imageObject = JSON.parse(details.hotelImage);
                    if (imageObject && imageObject.images) {
                      parsedImage = imageObject.images;
                    }
                  } catch (error) {
                    console.warn(`Error parsing hotel image JSON for room ${roomId}:`, error);
                  }
                } else if (details.hotelImage && details.hotelImage.toString) {
                  parsedImage = details.hotelImage.toString();
                } else {
                  console.warn(`Invalid format for hotel image for room ${roomId}:`, details.hotelImage);
                }
              } catch (error) {
                console.error(`Error parsing hotel image for room ${roomId}:`, error);
              }

              return {
              ...booking,
              hotelName: details.hotelName || 'Unknown Hotel',
              hotelImage: parsedImage,
              roomName: details.roomName || 'Unknown Room'
              };
            }),
            catchError(error => {
              console.error(`Error fetching details for room ${roomId}:`, error);
              return of(booking);
            })
            );
        });

        // Combine all observables
        forkJoin(detailObservables).subscribe({
          next: (enrichedBookings) => {
            this.bookings = enrichedBookings;
            this.filterBookings(this.activeFilter);
            this.isLoading = false;

            // Detailed logging
            console.log('Enriched Bookings:', this.bookings);
          },
          error: (error) => {
            console.error('Error processing bookings:', error);
            this.isLoading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error loading reservations:', error);
        this.isLoading = false;
      }
    });
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

    // Find the original reservation by ID
    this.reservationService.getReservationById(this.bookingToCancel.id).subscribe({
      next: (reservation) => {
        // Update the reservation status to CANCELLED
        const updatedReservation: Reservation = {
          ...reservation,
          status: ReservationStatus.CANCELLED
        };

        // If there's a payment, update its status too
        if (updatedReservation.payment) {
          updatedReservation.payment = {
            ...updatedReservation.payment,
            paymentStatus: PaymentStatus.CANCELLED
          };
        }

        // Update the reservation
        this.reservationService.updateReservation(this.bookingToCancel!.id, updatedReservation).subscribe({
          next: () => {
            this.isCancelling = false;
            this.showCancelModal = false;
            // Reload bookings to reflect the cancellation
            this.loadBookings();
          },
          error: (error) => {
            console.error('Error updating reservation:', error);
            this.isCancelling = false;
          }
        });
      },
      error: (error) => {
        console.error('Error fetching reservation:', error);
        this.isCancelling = false;
      }
    });
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

  getPaymentStatusText(status: PaymentStatus): string {
    return status.toString();
  }
}