import { Component, Input, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { ActivatedRoute, Router } from "@angular/router"
import { trigger, transition, style, animate, query, stagger, state } from "@angular/animations"
import { NavbarComponent } from "../navbar/navbar.component"
import { FooterComponent } from "../footer/footer.component"
import type { Hotel } from "../../../core/models/hotel.interface"
import type { Room } from "../../../core/models/room.interface"
import type { Review } from "../../../core/models/review.interface"

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
  @Input() hotel: Hotel | null = null;
  @Input() hotelRooms: Room[] = [];

  // Gallery images (based on the hotel)
  galleryImages: string[] = []
  currentImageIndex = 0
  showAllPhotos = false

  // Booking
  checkInDate = new Date().toISOString().split("T")[0]
  checkOutDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  guestCount = 2
  selectedRoomType = 1

  // Booking confirmation
  showBookingConfirmation = false
  bookingDetails: any = null

  // Reviews & other data
  reviews: Review[] = []
  nearbyAttractions: { name: string; distance: string }[] = []
  reviewCategories = [
    { name: "Cleanliness", score: 9.2 },
    { name: "Comfort", score: 9.5 },
    { name: "Location", score: 8.9 },
    { name: "Facilities", score: 9.0 },
    { name: "Staff", score: 9.7 },
    { name: "Value for money", score: 8.8 },
  ]

  ratings = [
    { name: "Excellent", percentage: 72 },
    { name: "Very Good", percentage: 20 },
    { name: "Average", percentage: 5 },
    { name: "Poor", percentage: 2 },
    { name: "Terrible", percentage: 1 },
  ]

  rooms: Room[] = []

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const hotelId = Number(params.get("id"))
      if (hotelId) {
        this.fetchHotelById(hotelId)
      } else {
        this.router.navigate(["/hotel-list"])
      }
    })
  }

  fetchHotelById(id: number) {
    setTimeout(() => {
      // Generate a mock hotel based on the ID
      this.hotel = this.generateMockHotel(id)

      // Generate rooms for this hotel
      this.rooms = this.generateRoomsForHotel(this.hotel)
      this.hotelRooms = this.rooms

      // Load additional data (reviews, attractions, etc.)
      this.loadAdditionalData()
    }, 500)
  }

  generateRoomsForHotel(hotel: Hotel): Room[] {
    const roomNames = ["Standard Room", "Deluxe Room", "Executive Suite", "Family Room", "Luxury Suite"]

    const roomImages = [
      "https://plus.unsplash.com/premium_photo-1661964402307-02267d1423f5?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1568495248636-6432b97bd949?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ]

    return roomNames.map((name, index) => {
      const basePrice = Math.floor(Math.random() * 300) + 100
      const hasDiscount = Math.random() > 0.5
      const discountPercentage = hasDiscount ? Math.floor(Math.random() * 20) + 5 : 0
      const originalPrice = hasDiscount ? Math.round(basePrice * (100 / (100 - discountPercentage))) : undefined
      const discountedPrice = hasDiscount ? basePrice : undefined

      return {
        id: index + 1,
        name: name,
        description: this.generateRoomDescription(name),
        price: hasDiscount ? discountedPrice! : basePrice,
        originalPrice: originalPrice,
        discount: discountPercentage,
        capacity: Math.floor(Math.random() * 3) + 1,
        image: roomImages[index],
        features: this.generateRoomFeatures(name),
      }
    })
  }

  private generateRoomDescription(roomName: string): string {
    const descriptions: { [key: string]: string } = {
      "Standard Room": "Comfortable and cozy room perfect for solo travelers or couples looking for a convenient stay.",
      "Deluxe Room": "Spacious room with modern amenities and city views, offering extra comfort and style.",
      "Executive Suite":
        "Luxurious suite with separate living area, ideal for business travelers or those seeking premium accommodations.",
      "Family Room": "Spacious room designed to accommodate families, with multiple beds and ample space for everyone.",
      "Luxury Suite":
        "Opulent suite with premium furnishings, breathtaking views, and top-tier amenities for an unforgettable experience.",
    }
    return descriptions[roomName] || "Comfortable and well-appointed room with modern amenities."
  }

  private generateRoomFeatures(roomName: string): string[] {
    const baseFeatures = ["Free WiFi", "Air Conditioning", "Flat-screen TV", "Mini Bar", "Coffee Maker", "Safe"]

    const specialFeatures: { [key: string]: string[] } = {
      "Standard Room": ["City View"],
      "Deluxe Room": ["City View", "Work Desk"],
      "Executive Suite": ["City View", "Work Desk", "Espresso Machine", "Separate Living Area"],
      "Family Room": ["Extra Bed", "Connecting Rooms Available"],
      "Luxury Suite": ["Private Balcony", "Jacuzzi", "Panoramic Views", "24-hour Room Service"],
    }

    const features = [...baseFeatures, ...(specialFeatures[roomName] || [])]
    return features.sort(() => 0.5 - Math.random()).slice(0, 4 + Math.floor(Math.random() * 4))
  }

  generateMockHotel(id: number): Hotel {
    // This is a simplified version - you should replace with your actual data
    const hotelNames = ["Grand Plaza Hotel", "Seaside Resort", "Urban Loft Suites", "Mountain View Lodge"]
    const locations = ["New York", "Los Angeles", "Chicago", "Miami"]
    const hotelImages = [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop",
    ]

    const index = (id - 1) % hotelNames.length
    const price = Math.floor(Math.random() * 900) + 100
    const hasDiscount = Math.random() > 0.7
    const discount = hasDiscount ? Math.floor(Math.random() * 30) + 10 : 0
    const originalPrice = hasDiscount ? Math.floor(price * (100 / (100 - discount))) : undefined

    return {
      id: id,
      name: hotelNames[index],
      location: locations[index % locations.length],
      price: price,
      originalPrice: originalPrice,
      discount: hasDiscount ? discount : undefined,
      rating: Number((Math.random() * 2 + 3).toFixed(1)),
      reviewCount: Math.floor(Math.random() * 1000) + 50,
      image: hotelImages[index % hotelImages.length],
      amenities: ["Free WiFi", "Pool", "Spa", "Gym", "Restaurant"],
      stars: Math.floor(Math.random() * 3) + 3,
      isFavorite: false,
      distance: `${(Math.random() * 10).toFixed(1)} km from center`,
      description:
        "This luxurious hotel offers comfortable accommodations with modern amenities. Guests can enjoy the convenient location, exceptional service, and relaxing atmosphere.",
    }
  }

  loadAdditionalData() {
    // Generate gallery images
    this.galleryImages = [
      this.hotel?.image || '',
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=1200&auto=format&fit=crop",
    ]

    // Mock review data
    this.reviews = [
      {
        id: 1,
        image:
          "https://images.unsplash.com/photo-1654110455429-cf322b40a906?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        author: "Michael Johnson",
        date: "October 15, 2023",
        rating: 9.5,
        title: "Exceptional stay with outstanding service",
        comment:
          "We had an amazing experience at " +
          this.hotel?.name +
          ". The staff was incredibly attentive and the facilities were top-notch. The room was spacious, clean, and had a breathtaking view of the city. The breakfast buffet offered a wide variety of delicious options.",
        pros: "Excellent location, friendly staff, comfortable beds",
        cons: "Parking was a bit expensive",
        stayType: "Family vacation",
      },
      {
        id: 2,
        image:
          "https://plus.unsplash.com/premium_photo-1689977807477-a579eda91fa2?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        author: "Sarah Williams",
        date: "September 28, 2023",
        rating: 8.7,
        title: "Great location and comfortable rooms",
        comment:
          "The hotel is perfectly located in the heart of the city, making it easy to explore all the major attractions. Our room was very comfortable and well-appointed. The only minor issue was some noise from the street, but that's expected in a central location.",
        pros: "Central location, modern amenities, helpful concierge",
        cons: "Some street noise at night",
        stayType: "Business trip",
      },
      {
        id: 3,
        image:
          "https://images.unsplash.com/photo-1633332755192-727a05c4013d?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YXZhdGFyfGVufDB8fDB8fHww",
        author: "David Chen",
        date: "November 5, 2023",
        rating: 9.8,
        title: "Luxury at its finest",
        comment:
          "This hotel exceeds all expectations. From the moment we arrived, we were treated like royalty. The room was immaculate and luxurious, with every detail thoughtfully considered. The spa services were exceptional and the restaurant served some of the best food we've had.",
        pros: "Exceptional service, beautiful decor, amazing spa",
        stayType: "Couple getaway",
      },
    ]

    // Mock nearby attractions
    this.nearbyAttractions = [
      { name: "Central Park", distance: "0.3 miles" },
      { name: "Metropolitan Museum of Art", distance: "0.7 miles" },
      { name: "Times Square", distance: "1.2 miles" },
      { name: "Empire State Building", distance: "1.5 miles" },
      { name: "Broadway Theater District", distance: "1.0 mile" },
      { name: "Fifth Avenue Shopping", distance: "0.4 miles" },
    ]
  }

  prevImage() {
    this.currentImageIndex = this.currentImageIndex === 0 ? this.galleryImages.length - 1 : this.currentImageIndex - 1
  }

  nextImage() {
    this.currentImageIndex = this.currentImageIndex === this.galleryImages.length - 1 ? 0 : this.currentImageIndex + 1
  }

  setCurrentImage(index: number) {
    this.currentImageIndex = index
  }

  getNights(): number {
    const checkIn = new Date(this.checkInDate)
    const checkOut = new Date(this.checkOutDate)
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays || 1
  }

  getSelectedRoom(): Room | undefined {
    return this.rooms.find((room) => room.id === this.selectedRoomType)
  }

  getSubtotal(): number {
    const room = this.getSelectedRoom()
    return room ? room.price * this.getNights() : 0
  }

  getTaxes(): number {
    return Math.round(this.getSubtotal() * 0.12)
  }

  getDiscount(): number {
    const room = this.getSelectedRoom()
    if (!room || !room.discount) return 0

    const originalPrice = room.originalPrice || room.price * (100 / (100 - room.discount))
    return Math.round((originalPrice - room.price) * this.getNights())
  }

  getTotal(): number {
    return this.getSubtotal() + this.getTaxes() - this.getDiscount()
  }

  formatCurrency(amount: number): string {
    return "$" + amount.toFixed(2)
  }

  bookNow() {
    const selectedRoom = this.getSelectedRoom()

    if (!selectedRoom) {
      alert("Please select a room to continue.")
      return
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
    }

    // Show booking confirmation
    this.showBookingConfirmation = true
  }

  closeBookingConfirmation() {
    this.showBookingConfirmation = false
  }

  proceedToPayment() {
    // In a real app, this would navigate to a payment page
    this.router.navigate(["/payment"], {
      state: {
        bookingDetails: this.bookingDetails,
      },
    })
  }
}

