import { Component, OnInit, ViewChild, ElementRef, NgZone } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { NavbarComponent } from "../navbar/navbar.component";
import { FooterComponent } from "../footer/footer.component";
import { trigger, transition, style, animate } from "@angular/animations";
import { HttpClient } from "@angular/common/http";
import { BookingService } from "../../../core/services/booking.service";
import { BookingStateService } from "../../../core/services/booking-state.service";
import { PaymentService } from "../../../core/services/payment.service";
import { ReservationService } from "../../../core/services/reservation.service";
import { Payment, PaymentStatus } from "../../../core/models/payment.interface";
import { Reservation, ReservationStatus } from "../../../core/models/reservation.interface";

declare var Stripe: any;

@Component({
  selector: "app-payment",
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent, RouterLink],
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
  @ViewChild("cardElement") cardElement!: ElementRef;

  stripe: any;
  card: any;
  cardErrors = "";

  bookingDetails: any;
  paymentMethod: "card" | "paypal" | "bank-transfer" = "card";
  isProcessing = false;
  paymentComplete = false;
  payment: Payment | null = null;
  bookingId = "";
  reservationId = "";
  email = "";
  name = "";
  address = "";
  city = "";
  state = "";
  zip = "";
  country = "US";
  paymentId = "";

  errors: { [key: string]: string } = {};

  constructor(
    private router: Router,
    private http: HttpClient,
    private zone: NgZone,
    private bookingService: BookingService,
    private bookingStateService: BookingStateService,
    private paymentService: PaymentService,
    private reservationService: ReservationService
  ) { }

  ngOnInit() {
    this.bookingDetails = this.bookingStateService.getBookingDetails();

    if (!this.bookingDetails) {
      const navigation = this.router.getCurrentNavigation();
      if (navigation?.extras?.state) {
        this.bookingDetails = navigation.extras.state["bookingDetails"];
      }
    }
    if (!this.bookingDetails) {
      console.error("No booking details received");
      this.router.navigate(["/hotel-list"]);
      return;
    }

    console.log("Booking details loaded:", this.bookingDetails);

    if (!this.bookingDetails.room) {
      console.error("Invalid booking details - missing room information");
      this.router.navigate(["/hotel-list"]);
      return;
    }

    this.loadStripe();
  }

  ngAfterViewInit() {
    this.initializeStripe();
  }

  loadStripe() {
    if (!window.document.getElementById("stripe-script")) {
      const script = window.document.createElement("script");
      script.id = "stripe-script";
      script.type = "text/javascript";
      script.src = "https://js.stripe.com/v3/";
      script.onload = () => {
        try {
          this.stripe = Stripe("pk_test_51OgSUzCvwqwJehZs0WMZBnSXxZkAb8xWCY94HnqIGK8fUwFDUVb1IHcVrcxWgoVm8VGMGGkunfombZWj7DtPhm56004kgSDWb8");
          this.initializeStripe();
        } catch (error) {
          console.error("Error initializing Stripe:", error);
        }
      };
      script.onerror = () => {
        console.error("Failed to load Stripe.js script.");
      };
      window.document.body.appendChild(script);
    } else {
      try {
        this.stripe = Stripe("pk_test_51OgSUzCvwqwJehZs0WMZBnSXxZkAb8xWCY94HnqIGK8fUwFDUVb1IHcVrcxWgoVm8VGMGGkunfombZWj7DtPhm56004kgSDWb8");
        this.initializeStripe();
      } catch (error) {
        console.error("Error initializing Stripe:", error);
      }
    }
  }

  initializeStripe() {
    if (this.stripe && this.cardElement) {
      const elements = this.stripe.elements();

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
      });

      // Mount the card element
      this.card.mount(this.cardElement.nativeElement);

      // Handle real-time validation errors
      this.card.addEventListener("change", (event: any) => {
        this.zone.run(() => {
          this.cardErrors = event.error ? event.error.message : "";
        });
      });
    }
  }

  validateForm(): boolean {
    this.errors = {};
    let isValid = true;

    if (this.paymentMethod === "card") {
      if (!this.name) {
        this.errors["name"] = "Please enter your name";
        isValid = false;
      }

      if (!this.email || !this.email.includes("@")) {
        this.errors["email"] = "Please enter a valid email address";
        isValid = false;
      }

      if (!this.address) {
        this.errors["address"] = "Please enter your address";
        isValid = false;
      }

      if (!this.city) {
        this.errors["city"] = "Please enter your city";
        isValid = false;
      }

      if (!this.zip) {
        this.errors["zip"] = "Please enter your ZIP code";
        isValid = false;
      }
    }

    return isValid;
  }

  async processPayment() {
    if (!this.validateForm()) {
        return;
    }

    this.isProcessing = true;
    const amount = this.bookingDetails?.total || 0;

    try {
        const token = localStorage.getItem('auth-token');
        let userId = "Guest";

        if (token) {
            try {
                const decodedToken = JSON.parse(atob(token.split('.')[1]));
                userId = decodedToken.userId || "Guest";
            } catch (error) {
                console.error("Error decoding token:", error);
            }
        }

        const checkIn = new Date(this.bookingDetails.checkIn).toISOString().slice(0, 19); // Format: YYYY-MM-DDTHH:mm:ss
        const checkOut = new Date(this.bookingDetails.checkOut).toISOString().slice(0, 19); // Format: YYYY-MM-DDTHH:mm:ss

        // Call the backend to create a Stripe Payment Intent
        const response = await this.paymentService.createPaymentIntent(amount).toPromise();
        const stripePaymentIntentId = response?.paymentIntentId ?? '';

        const reservation: Reservation = {
            roomId: this.bookingDetails.room.id,
            checkIn: checkIn,
            checkOut: checkOut,
            clientId: userId,
            totalPrice: parseFloat((this.bookingDetails.total || 0).toFixed(2)), // Ensure it's a number with two decimal places
            status: ReservationStatus.PENDING,
            payment: {
                amount: parseFloat((this.bookingDetails.total || 0).toFixed(2)), // Ensure it's a number with two decimal places
                paymentMethod: this.paymentMethod === "card" ? "Credit Card" :
                    this.paymentMethod === "paypal" ? "PayPal" : "Bank Transfer",
                stripePaymentIntentId: stripePaymentIntentId, 
                paymentStatus: PaymentStatus.PENDING,
                payerName: this.name,
                payerEmail: this.email,
                billingAddress: this.address,
                billingCity: this.city,
                billingState: this.state,
                billingZip: this.zip,
                billingCountry: this.country,
            }
        };

        console.log("Sending reservation request:", reservation);

        // Use the createReservationWithPayment method
        this.reservationService.createReservation(reservation).subscribe(
            (createdReservation) => {
                console.log('Reservation created successfully:', createdReservation);

                // Update local state
                this.reservationId = createdReservation.id || '';
                this.paymentId = createdReservation.payment?.id || '';

                // Process payment based on method
                this.processPaymentByMethod(createdReservation.payment);
            },
            (error) => {
                console.error("Error creating reservation:", error);
                this.zone.run(() => {
                    this.cardErrors = error.message || "An error occurred during reservation creation.";
                    this.isProcessing = false;
                });
            }
        );
    } catch (error: any) {
        console.error("Error during payment processing:", error);
        this.cardErrors = error.message || "An error occurred during payment processing.";
        this.isProcessing = false;
    }
}

  // Modify processPaymentByMethod to accept PaymentDTO
  private async processPaymentByMethod(payment: any) {
    if (this.paymentMethod === "card") {
      try {
        const { paymentMethod: stripePaymentMethod, error } = await this.stripe.createPaymentMethod({
          type: "card",
          card: this.card,
          billing_details: {
            name: payment.payerName,
            email: payment.payerEmail,
            address: {
              line1: payment.billingAddress,
              city: payment.billingCity,
              state: payment.billingState,
              postal_code: payment.billingZip,
              country: payment.billingCountry,
            },
          },
        });

        if (error) {
          this.cardErrors = error.message;
          this.isProcessing = false;
          return;
        }
        // Confirm payment with Stripe using PaymentIntent ID
        const { error: confirmError } = await this.stripe.confirmCardPayment(payment.stripePaymentIntentId, {
          payment_method: stripePaymentMethod.id,
        });

        if (confirmError) {
          this.zone.run(() => {
            this.cardErrors = confirmError.message || "An error occurred during payment confirmation.";
            this.isProcessing = false;
          });
          return;
        }

        this.zone.run(() => {
          // Update reservation status to confirmed
          this.updateReservationStatus(this.reservationId, ReservationStatus.CONFIRMED);
          this.addBookingToHistory();
          this.isProcessing = false;
          this.paymentComplete = true;
        });
      } catch (error: any) {
        this.cardErrors = error.message || "An error occurred during payment processing.";
        this.isProcessing = false;
      }
    } else {
      // For PayPal and Bank Transfer
      this.zone.run(() => {
        // Update reservation status to confirmed
        this.updateReservationStatus(this.reservationId, ReservationStatus.CONFIRMED);
        this.addBookingToHistory();
        this.isProcessing = false;
        this.paymentComplete = true;
      });
    }
  }

  updateReservationStatus(reservationId: string, status: ReservationStatus) {
    this.reservationService.getReservationById(reservationId).subscribe(
      (reservation) => {
        reservation.status = status;
        this.reservationService.updateReservation(reservationId, reservation).subscribe(
          (updatedReservation) => {
            console.log('Reservation status updated to:', status);
          },
          (error) => {
            console.error('Error updating reservation status:', error);
          }
        );
      },
      (error) => {
        console.error('Error fetching reservation:', error);
      }
    );
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
      paymentId: this.paymentId,
      reservationId: this.reservationId
    };

    this.bookingService.addBooking(booking).subscribe((result) => {
      this.bookingId = result.id;
    });
  }

  viewBookings() {
    this.router.navigate(["/bookings"]);
  }

  viewBookingDetails() {
    if (this.bookingId) {
      this.router.navigate(["/booking-details", this.bookingId]);
    } else {
      this.router.navigate(["/bookings"]);
    }
  }
}

