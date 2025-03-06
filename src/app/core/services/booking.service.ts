import { Injectable } from "@angular/core"
import { type Observable, of } from "rxjs"
import { delay } from "rxjs/operators"

export interface Booking {
  id: string
  hotelId: number
  hotelName: string
  hotelImage: string
  roomName: string
  checkIn: string
  checkOut: string
  guests: number
  totalAmount: number
  status: "upcoming" | "completed" | "cancelled"
  bookingDate: string
  paymentMethod: string
}

@Injectable({
  providedIn: "root",
})
export class BookingService {
  private bookings: Booking[] = []

  constructor() {
    // Initialize with some mock bookings
    this.generateMockBookings()
  }

  getBookings(): Observable<Booking[]> {
    // Simulate API call with delay
    return of(this.bookings).pipe(delay(500))
  }

  getBookingById(id: string): Observable<Booking | undefined> {
    const booking = this.bookings.find((b) => b.id === id)
    return of(booking).pipe(delay(300))
  }

  addBooking(booking: Booking): Observable<Booking> {
    this.bookings.unshift(booking)
    return of(booking).pipe(delay(300))
  }

  cancelBooking(id: string): Observable<boolean> {
    const booking = this.bookings.find((b) => b.id === id)
    if (booking && booking.status === "upcoming") {
      booking.status = "cancelled"
      return of(true).pipe(delay(300))
    }
    return of(false).pipe(delay(300))
  }

  private generateMockBookings(): void {
    const statuses: ("upcoming" | "completed" | "cancelled")[] = ["upcoming", "completed", "cancelled"]
    const hotelNames = ["Grand Plaza Hotel", "Seaside Resort", "Urban Loft Suites", "Mountain View Lodge"]
    const roomTypes = ["Standard Room", "Deluxe Room", "Executive Suite", "Family Room", "Luxury Suite"]
    const hotelImages = [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop",
    ]
    const paymentMethods = ["Credit Card", "PayPal", "Bank Transfer"]

    // Generate 5 mock bookings
    for (let i = 0; i < 5; i++) {
      const checkInDate = new Date()
      checkInDate.setDate(checkInDate.getDate() + (i % 2 === 0 ? 15 : -15)) 

      const checkOutDate = new Date(checkInDate)
      checkOutDate.setDate(checkOutDate.getDate() + Math.floor(Math.random() * 5) + 1)

      const hotelIndex = Math.floor(Math.random() * hotelNames.length)
      const status = i < 2 ? "upcoming" : i < 4 ? "completed" : "cancelled"

      this.bookings.push({
        id: `BK${Math.floor(Math.random() * 1000000)
          .toString()
          .padStart(6, "0")}`,
        hotelId: hotelIndex + 1,
        hotelName: hotelNames[hotelIndex],
        hotelImage: hotelImages[hotelIndex],
        roomName: roomTypes[Math.floor(Math.random() * roomTypes.length)],
        checkIn: checkInDate.toISOString().split("T")[0],
        checkOut: checkOutDate.toISOString().split("T")[0],
        guests: Math.floor(Math.random() * 4) + 1,
        totalAmount: Math.floor(Math.random() * 1000) + 200,
        status: status,
        bookingDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      })
    }
  }
}

