import { Component, Input, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { trigger, transition, style, animate, query, stagger, state } from "@angular/animations";
import { NavbarComponent } from "../navbar/navbar.component";
import { FooterComponent } from "../footer/footer.component";
import { HotelService } from "../../../core/services/hotel.service";
import { RoomService } from "../../../core/services/room.service";
import type { HotelFormData } from "../../../core/models/hotel.interface";
import { RoomStatus, RoomType, type RoomFormData } from "../../../core/models/room.interface";
import type { Review } from "../../../core/models/review.interface";
import { BookingStateService } from "../../../core/services/booking-state.service";

@Component({
  selector: "app-hotel-detail",
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent],
  animations: [
    trigger("fadeIn", [transition(":enter", [style({ opacity: 0 }), animate("400ms ease-in", style({ opacity: 1 }))])]),
    trigger("slideInRight", [
      transition(":enter", [
        style({ transform: "translateX(30px)", opacity: 0 }),
        animate("500ms ease-out", style({ transform: "translateX(0)", opacity: 1 })),
      ]),
    ]),
    trigger("slideInLeft", [
      transition(":enter", [
        style({ transform: "translateX(-30px)", opacity: 0 }),
        animate("500ms ease-out", style({ transform: "translateX(0)", opacity: 1 })),
      ]),
    ]),
    trigger("slideInUp", [
      transition(":enter", [
        style({ transform: "translateY(30px)", opacity: 0 }),
        animate("500ms ease-out", style({ transform: "translateY(0)", opacity: 1 })),
      ]),
    ]),
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
    trigger("expandCollapse", [
      state("collapsed", style({ height: "0", overflow: "hidden", opacity: 0 })),
      state("expanded", style({ height: "*", opacity: 1 })),
      transition("collapsed <=> expanded", [animate("300ms ease-in-out")]),
    ]),
    trigger("galleryImage", [
      transition(":increment", [
        style({ transform: "translateX(100%)", opacity: 0 }),
        animate("300ms ease-out", style({ transform: "translateX(0)", opacity: 1 })),
      ]),
      transition(":decrement", [
        style({ transform: "translateX(-100%)", opacity: 0 }),
        animate("300ms ease-out", style({ transform: "translateX(0)", opacity: 1 })),
      ]),
    ]),
  ],
  templateUrl: "./hotel-details.component.html",
})
export class HotelDetailComponent implements OnInit {
  @Input() hotel: HotelFormData | null = null;
  @Input() hotelRooms: RoomFormData[] = [];

  galleryImages: string[] = [];
  currentImageIndex = 0;
  showAllPhotos = false;

  checkInDate = new Date().toISOString().split("T")[0];
  checkOutDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  guestCount = 2;
  selectedRoomType: string | null = null;
  bookingDetails: any = null;
  mapUrl!: string;
  dateErrorMessage: string | null = null;



  reviews: Review[] = [];
  nearbyAttractions: { name: string; distance: string }[] = [];
  rooms: RoomFormData[] = [];
  showBookingConfirmation: boolean = false;

  closeBookingConfirmation(): void {
    this.showBookingConfirmation = false;
  }

  constructor(
    private route: ActivatedRoute,

    private router: Router,
    private hotelService: HotelService,
    private roomService: RoomService,
    private bookingStateService: BookingStateService,
  ) {
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const hotelId = params.get("id");
      if (hotelId) {
        this.fetchHotelById(hotelId);
        this.fetchRoomsByHotelId(hotelId);
      } else {
        this.router.navigate(["/hotel-list"]);
      }
    });
    setTimeout(() => {
      this.generateMapUrl();
    });
  }
  generateRandomLocation(): string {
    const lat = (40.7128 + (Math.random() * 0.1 - 0.05)).toFixed(6);
    const lng = (-74.006 + (Math.random() * 0.1 - 0.05)).toFixed(6);
    return `${lat},${lng}`;
  }

  generateMapUrl(): void {
    const location = this.generateRandomLocation();
    this.mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${location}&zoom=14&size=800x400&markers=color:red%7C${location}&key=AIzaSyCE38p2PlbXEsKLF93mkE4WPmtVNf_EO_k`;
  }



  fetchHotelById(id: string) {
    this.hotelService.getHotelById(id).subscribe({
      next: (hotel) => {
        this.hotel = hotel;
        this.galleryImages = hotel.images || [];
        this.loadAdditionalData();
      },
      error: (err) => {
        console.error("Error fetching hotel details:", err);
        this.router.navigate(["/hotel-list"]);
      },
    });
  }
  prevImage() {
    if (this.galleryImages.length > 0) {
      this.currentImageIndex =
        (this.currentImageIndex - 1 + this.galleryImages.length) % this.galleryImages.length;
    }
  }

  nextImage() {
    if (this.galleryImages.length > 0) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.galleryImages.length;
    }
  }
  setCurrentImage(index: number) {
    if (index >= 0 && index < this.galleryImages.length) {
      this.currentImageIndex = index;
    }
  }
  reviewCategories = [
    { name: 'Cleanliness', score: 9.5 },
    { name: 'Comfort', score: 9.0 },
    { name: 'Location', score: 8.8 },
    { name: 'Facilities', score: 9.2 },
    { name: 'Staff', score: 9.7 },
    { name: 'Value for money', score: 8.5 },
  ];
  ratings = [
    { name: 'Excellent', percentage: 50 },
    { name: 'Very Good', percentage: 30 },
    { name: 'Average', percentage: 15 },
    { name: 'Poor', percentage: 5 },
  ];


  fetchRoomsByHotelId(hotelId: string) {
    this.roomService.getRoomDataByHotelId(hotelId).subscribe({
      next: (rooms) => {
        this.rooms = Array.isArray(rooms) ? rooms.map((room) => ({
          ...room,
          type: RoomType[room.type as keyof typeof RoomType], // Map type to enum
          status: RoomStatus[room.status as keyof typeof RoomStatus], // Map status to enum
        })) : [];
        this.hotelRooms = this.rooms;
      },
      error: (err) => {
        console.error("Error fetching rooms:", err);
      },
    });
  }
  loadAdditionalData() {
    this.nearbyAttractions = [
      { name: "Central Park", distance: "0.3 miles" },
      { name: "Metropolitan Museum of Art", distance: "0.7 miles" },
      { name: "Times Square", distance: "1.2 miles" },
      { name: "Empire State Building", distance: "1.5 miles" },
      { name: "Broadway Theater District", distance: "1.0 mile" },
      { name: "Fifth Avenue Shopping", distance: "0.4 miles" },
    ];
  }

  getNights(): number {
    const checkIn = new Date(this.checkInDate);
    const checkOut = new Date(this.checkOutDate);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  }

  getSelectedRoom(): RoomFormData | undefined {
    return this.rooms.find((room) => room.id === this.selectedRoomType);
  }

  getSubtotal(): number {
    const room = this.getSelectedRoom();
    return room ? room.price * this.getNights() : 0;
  }

  getTaxes(): number {
    return Math.round(this.getSubtotal() * 0.12);
  }

  getDiscount(): number {
    const room = this.getSelectedRoom();
    if (!room || !room.discount) return 0;

    const originalPrice = room.originalPrice || room.price * (100 / (100 - room.discount));
    return Math.round((originalPrice - room.price) * this.getNights());
  }

  getTotal(): number {
    return this.getSubtotal() + this.getTaxes() - this.getDiscount();
  }

  formatCurrency(amount: number): string {
    return "$" + amount.toFixed(2);
  }

  bookNow() {
    if (!this.selectedRoomType) {
      alert("Please select a room to continue.");
      return;
    }

    const selectedRoom = this.getSelectedRoom();

    if (!selectedRoom) {
      alert("Please select a room to continue.");
      return;
    }

    // Create booking details object
    this.bookingDetails = {
      hotel: this.hotel,
      room: selectedRoom,
      checkIn: this.checkInDate,
      checkOut: this.checkOutDate,
      guests: this.guestCount,
      nights: this.getNights(),
      subtotal: this.getSubtotal(),
      taxes: this.getTaxes(),
      discount: this.getDiscount(),
      total: this.getTotal(),
      bookingId:
        "BK" +
        Math.floor(Math.random() * 1000000)
          .toString()
          .padStart(6, "0"),
      bookingDate: new Date().toISOString().split("T")[0],
    };

    this.bookingStateService.setBookingDetails(this.bookingDetails);

    this.proceedToPayment();
  }

  proceedToPayment() {
    this.router.navigate(["/payment"]);
  }

  selectRoom(roomId: string) {
    this.selectedRoomType = roomId;
    setTimeout(() => {
      const bookingWidget = document.getElementById("booking-widget");
      if (bookingWidget) {
        bookingWidget.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  }

  isRoomSelected(roomId: string): boolean {
    return this.selectedRoomType === roomId;
  }
    randomFeature(): string {
    const features = [
      "Free Wi-Fi in all rooms",
      "Complimentary breakfast",
      "Swimming pool access",
      "24-hour front desk service",
      "Fitness center availability",
      "Pet-friendly rooms",
      "Airport shuttle service",
      "On-site restaurant and bar",
    ];
    return features[Math.floor(Math.random() * features.length)];
  }

  validateDates(): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkIn = new Date(this.checkInDate);
    const checkOut = new Date(this.checkOutDate);

    this.dateErrorMessage = null;

    if (checkIn < today) {
      this.dateErrorMessage = "Check-in date cannot be in the past.";
      return false;
    }
    if (checkOut <= checkIn) {
      this.dateErrorMessage = "Check-out date must be after the check-in date.";
      return false;
    }

    return true;
  }
onDateChange(): void {
  this.validateDates();
}

  generateSelectedRoomType(): string {
    const selectedRoom = this.getSelectedRoom();
    return selectedRoom
      ? `Room Type: ${selectedRoom.type}, Price: ${this.formatCurrency(selectedRoom.price)}`
      : "No room selected";
  }
}
