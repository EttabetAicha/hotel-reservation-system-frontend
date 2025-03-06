import { Injectable } from "@angular/core"

@Injectable({
  providedIn: "root",
})
export class BookingStateService {
  private currentBookingDetails: any = null

  setBookingDetails(details: any) {
    this.currentBookingDetails = details
  }

  getBookingDetails() {
    return this.currentBookingDetails
  }

  clearBookingDetails() {
    this.currentBookingDetails = null
  }
}

