import { Component, type OnInit, ViewChild, type ElementRef, NgZone } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { Router, RouterLink } from "@angular/router"
import { NavbarComponent } from "../navbar/navbar.component"
import { FooterComponent } from "../footer/footer.component"
import { trigger, transition, style, animate } from "@angular/animations"
import { HttpClient } from "@angular/common/http"
import { BookingService } from "../../../core/services/booking.service"
import { BookingStateService } from "../../../core/services/booking-state.service"

declare var Stripe: any

@Component({
  selector: "app-payment",
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent,RouterLink],
  animations: [
    trigger("fadeIn", [transition(":enter", [style({ opacity: 0 }), animate("400ms ease-in", style({ opacity: 1 }))])]),
    trigger("slideInUp", [
      transition(":enter", [
        style({ transform: "translateY(30px)", opacity: 0 }),
        animate("500ms ease-out", style({ transform: "translateY(0)", opacity: 1 })),
      ]),
    ]),
  ],
  templateUrl: "./payment.component.html",
})
export class PaymentComponent implements OnInit {
  @ViewChild("cardElement") cardElement!: ElementRef

  stripe: any
  card: any
  cardErrors = ""

  bookingDetails: any
  paymentMethod: "card" | "paypal" | "bank-transfer" = "card"
  isProcessing = false
  paymentComplete = false
  bookingId = ""

  // Customer information
  email = ""
  name = ""
  address = ""
  city = ""
  state = ""
  zip = ""
  country = "US"

  // Form validation
  errors: { [key: string]: string } = {}

  constructor(
    private router: Router,
    private http: HttpClient,
    private zone: NgZone,
    private bookingService: BookingService,
    private bookingStateService: BookingStateService,
  ) {}

  ngOnInit() {
    // Try to get booking details from the service first
    this.bookingDetails = this.bookingStateService.getBookingDetails()

    // If not available in service, try to get from router state
    if (!this.bookingDetails) {
      const navigation = this.router.getCurrentNavigation()
      if (navigation?.extras?.state) {
        this.bookingDetails = navigation.extras.state["bookingDetails"]
      }
    }

    // If still no booking details, redirect to hotel list
    if (!this.bookingDetails) {
      console.error("No booking details received")
      this.router.navigate(["/hotel-list"])
      return
    }

    console.log("Booking details loaded:", this.bookingDetails)

    // Validate that we have booking details with a selected room
    if (!this.bookingDetails.room) {
      console.error("Invalid booking details - missing room information")
      this.router.navigate(["/hotel-list"])
      return
    }

    // Load Stripe.js
    this.loadStripe()
  }

  ngAfterViewInit() {
    // Initialize Stripe elements after view is initialized
    this.initializeStripe()
  }

  loadStripe() {
    if (!window.document.getElementById("stripe-script")) {
      const script = window.document.createElement("script")
      script.id = "stripe-script"
      script.type = "text/javascript"
      script.src = "https://js.stripe.com/v3/"
      script.onload = () => {
        this.stripe = Stripe("pk_test_51OgSUzCvwqwJehZs0WMZBnSXxZkAb8xWCY94HnqIGK8fUwFDUVb1IHcVrcxWgoVm8VGMGGkunfombZWj7DtPhm56004kgSDWb8")
        this.initializeStripe()
      }
      window.document.body.appendChild(script)
    } else {
      this.stripe = Stripe("pk_test_51OgSUzCvwqwJehZs0WMZBnSXxZkAb8xWCY94HnqIGK8fUwFDUVb1IHcVrcxWgoVm8VGMGGkunfombZWj7DtPhm56004kgSDWb8")
      this.initializeStripe()
    }
  }

  initializeStripe() {
    if (this.stripe && this.cardElement) {
      const elements = this.stripe.elements()

      this.card = elements.create("card", {
        style: {
          base: {
            color: "#32325d",
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            fontSmoothing: "antialiased",
            fontSize: "16px",
            "::placeholder": {
              color: "#aab7c4",
            },
          },
          invalid: {
            color: "#fa755a",
            iconColor: "#fa755a",
          },
        },
      })

      // Mount the card element
      this.card.mount(this.cardElement.nativeElement)

      // Handle real-time validation errors
      this.card.addEventListener("change", (event: any) => {
        this.zone.run(() => {
          this.cardErrors = event.error ? event.error.message : ""
        })
      })
    }
  }

  validateForm(): boolean {
    this.errors = {}
    let isValid = true

    if (this.paymentMethod === "card") {
      if (!this.name) {
        this.errors["name"] = "Please enter your name"
        isValid = false
      }

      if (!this.email || !this.email.includes("@")) {
        this.errors["email"] = "Please enter a valid email address"
        isValid = false
      }

      if (!this.address) {
        this.errors["address"] = "Please enter your address"
        isValid = false
      }

      if (!this.city) {
        this.errors["city"] = "Please enter your city"
        isValid = false
      }

      if (!this.zip) {
        this.errors["zip"] = "Please enter your ZIP code"
        isValid = false
      }
    }

    return isValid
  }

  async processPayment() {
    if (!this.validateForm()) {
      return
    }

    this.isProcessing = true

    if (this.paymentMethod === "card") {
      try {
        // Create payment method
        const { paymentMethod, error } = await this.stripe.createPaymentMethod({
          type: "card",
          card: this.card,
          billing_details: {
            name: this.name,
            email: this.email,
            address: {
              line1: this.address,
              city: this.city,
              state: this.state,
              postal_code: this.zip,
              country: this.country,
            },
          },
        })

        if (error) {
          this.cardErrors = error.message
          this.isProcessing = false
          return
        }

        // Send payment method ID to your server
        // Replace with your actual API endpoint
        this.http
          .post("/api/create-payment-intent", {
            paymentMethodId: paymentMethod.id,
            amount: this.bookingDetails.total * 100, // Convert to cents
            currency: "usd",
            bookingDetails: this.bookingDetails,
          })
          .subscribe(
            (response: any) => {
              // Handle successful payment
              this.zone.run(() => {
                this.addBookingToHistory()
                this.isProcessing = false
                this.paymentComplete = true
              })
            },
            (error) => {
              // Handle payment error
              this.zone.run(() => {
                this.cardErrors = error.message || "An error occurred during payment processing."
                this.isProcessing = false
              })
            },
          )

        // For demo purposes, simulate a successful payment
        setTimeout(() => {
          this.zone.run(() => {
            this.addBookingToHistory()
            this.isProcessing = false
            this.paymentComplete = true
          })
        }, 2000)
      } catch (error: any) {
        this.cardErrors = error.message || "An error occurred during payment processing."
        this.isProcessing = false
      }
    } else {
      // Handle other payment methods (PayPal, Bank Transfer)
      // For demo purposes, simulate a successful payment
      setTimeout(() => {
        this.zone.run(() => {
          this.addBookingToHistory()
          this.isProcessing = false
          this.paymentComplete = true
        })
      }, 2000)
    }
  }

  addBookingToHistory() {
    // Create a booking record
    const booking = {
      id: this.bookingDetails.bookingId,
      hotelId: this.bookingDetails.hotel.id,
      hotelName: this.bookingDetails.hotel.name,
      hotelImage: this.bookingDetails.hotel.image,
      roomName: this.bookingDetails.room.name,
      checkIn: this.bookingDetails.checkIn,
      checkOut: this.bookingDetails.checkOut,
      guests: this.bookingDetails.guests,
      totalAmount: this.bookingDetails.total,
      status: "upcoming" as "upcoming" | "completed" | "cancelled",
      bookingDate: this.bookingDetails.bookingDate,
      paymentMethod:
        this.paymentMethod === "card" ? "Credit Card" : this.paymentMethod === "paypal" ? "PayPal" : "Bank Transfer",
    }

    this.bookingService.addBooking(booking).subscribe((result) => {
      this.bookingId = result.id
    })
  }

  viewBookings() {
    this.router.navigate(["/bookings"])
  }

  viewBookingDetails() {
    if (this.bookingId) {
      this.router.navigate(["/booking-details", this.bookingId])
    } else {
      this.router.navigate(["/bookings"])
    }
  }
}

