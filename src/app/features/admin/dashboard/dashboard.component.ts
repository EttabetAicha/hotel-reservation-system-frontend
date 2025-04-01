// dashboard.component.ts
import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReservationService } from "../../../core/services/reservation.service";
import { HotelService } from "../../../core/services/hotel.service";
import { RoomService } from "../../../core/services/room.service";
import { forkJoin } from "rxjs";
import { Reservation, ReservationStatus } from "../../../core/models/reservation.interface";
import { HotelFormData } from "../../../core/models/hotel.interface";
import { RoomFormData, RoomStatus, RoomType } from "../../../core/models/room.interface";

@Component({
  selector: "app-admin-dashboard",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./dashboard.component.html",
})
export class AdminDashboardComponent implements OnInit {
  // Data containers
  reservations: Reservation[] = [];
  hotels: HotelFormData[] = [];
  rooms: RoomFormData[] = [];

  // Dashboard stats
  totalBookings: number = 0;
  totalRevenue: number = 0;
  occupancyRate: number = 0;
  cancellations: number = 0;

  // Booking stats
  confirmedBookings: number = 0;
  pendingBookings: number = 0;
  cancelledBookings: number = 0;

  // Room stats
  roomsByType: { type: string, count: number, percentage: number }[] = [];
  roomsByStatus: { status: string, count: number, percentage: number, color: string }[] = [];

  topHotels: { name: string, bookings: number, revenue: number }[] = [];
  averageRating: number = 0;

  // Revenue stats
  revenueByRoomType: { type: string, revenue: number, percentage: number }[] = [];
  monthlyRevenue: { month: string, revenue: number }[] = [];

  // Recent bookings
  recentBookings: any[] = [];
  upcomingCheckIns: any[] = [];
  upcomingCheckOuts: any[] = [];

  // Hotel occupancy
  hotelOccupancy: any[] = [];

  // Loading states
  isLoading: boolean = true;
  statsLoaded: boolean = false;
  bookingsLoaded: boolean = false;
  occupancyLoaded: boolean = false;

  // Time period for stats
  selectedPeriod: 'weekly' | 'monthly' | 'yearly' = 'monthly';

  // Tasks (could be fetched from a service in the future)
  tasks = [
    { text: "Review new booking requests", completed: false },
    { text: "Update room availability for weekend", completed: true },
    { text: "Respond to customer inquiries", completed: false },
    { text: "Schedule maintenance for Room 302", completed: false },
    { text: "Review monthly revenue report", completed: true },
  ];

  constructor(
    private reservationService: ReservationService,
    private hotelService: HotelService,
    private roomService: RoomService
  ) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.isLoading = true;

    forkJoin({
      hotels: this.hotelService.getAllHotels(),
      rooms: this.roomService.getAllRoomDatas(),
      reservations: this.reservationService.getAllReservations()
    }).subscribe({
      next: (results) => {
        this.hotels = results.hotels;
        this.rooms = results.rooms;
        this.reservations = results.reservations;

        // Process the data
        this.calculateStats();
        this.calculateRoomStats();
        this.calculateHotelStats();
        this.calculateRevenueStats();
        this.processRecentBookings();
        this.processUpcomingBookings();
        this.calculateHotelOccupancy();

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.isLoading = false;
      }
    });
  }

  calculateStats(): void {
    this.totalBookings = this.reservations.length;

    this.confirmedBookings = this.reservations.filter(r => r.status === ReservationStatus.CONFIRMED).length;
    this.pendingBookings = this.reservations.filter(r => r.status === ReservationStatus.PENDING).length;
    this.cancelledBookings = this.reservations.filter(r => r.status === ReservationStatus.CANCELLED).length;

    this.totalRevenue = this.reservations
      .filter(r => r.status !== ReservationStatus.CANCELLED)
      .reduce((sum, reservation) => sum + (reservation.totalPrice || 0), 0);

    const occupiedRooms = this.rooms.filter(room => room.status === RoomStatus.OCCUPIED).length;
    const totalRooms = this.rooms.length;

    this.occupancyRate = totalRooms > 0
      ? Math.round((occupiedRooms / totalRooms) * 100)
      : 0;

    this.cancellations = this.cancelledBookings;

    this.statsLoaded = true;
  }

  calculateRoomStats(): void {
    const typeCount: Record<string, number> = {};

    this.rooms.forEach(room => {
      const typeDisplay = this.getRoomTypeDisplay(room.type);
      typeCount[typeDisplay] = (typeCount[typeDisplay] || 0) + 1;
    });

    this.roomsByType = Object.entries(typeCount).map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / this.rooms.length) * 100)
    })).sort((a, b) => b.count - a.count);

    // Calculate rooms by status
    const statusCount: Record<string, number> = {};

    this.rooms.forEach(room => {
      const statusDisplay = this.getRoomStatusDisplay(room.status);
      statusCount[statusDisplay] = (statusCount[statusDisplay] || 0) + 1;
    });

    this.roomsByStatus = Object.entries(statusCount).map(([status, count]) => {
      let color = '';
      switch(status) {
        case 'Available': color = 'bg-green-500'; break;
        case 'Occupied': color = 'bg-blue-500'; break;
        case 'Maintenance': color = 'bg-yellow-500'; break;
        case 'Reserved': color = 'bg-purple-500'; break;
        default: color = 'bg-gray-500';
      }

      return {
        status,
        count,
        percentage: Math.round((count / this.rooms.length) * 100),
        color
      };
    }).sort((a, b) => b.count - a.count);
  }

  calculateHotelStats(): void {
    // Calculate top hotels by bookings and revenue
    const hotelBookings: Record<string, number> = {};
    const hotelRevenue: Record<string, number> = {};

    this.reservations.forEach(reservation => {
      const room = this.rooms.find(r => r.id === reservation.roomId);
      if (room) {
        const hotelId = room.hotel;
        hotelBookings[hotelId] = (hotelBookings[hotelId] || 0) + 1;
        hotelRevenue[hotelId] = (hotelRevenue[hotelId] || 0) + (reservation.totalPrice || 0);
      }
    });

    this.topHotels = Object.entries(hotelBookings).map(([hotelId, bookings]) => {
      const hotel = this.hotels.find(h => h.id === hotelId);
      return {
        name: hotel?.name || 'Unknown Hotel',
        bookings,
        revenue: hotelRevenue[hotelId] || 0
      };
    }).sort((a, b) => b.bookings - a.bookings).slice(0, 5);

    // Calculate average hotel rating
    const totalRating = this.hotels.reduce((sum, hotel) => {
      const rating = parseFloat(hotel.rating);
      return sum + (isNaN(rating) ? 0 : rating);
    }, 0);

    this.averageRating = this.hotels.length > 0
      ? parseFloat((totalRating / this.hotels.length).toFixed(1))
      : 0;
  }

  calculateRevenueStats(): void {
    // Calculate revenue by room type
    const typeRevenue: Record<string, number> = {};

    this.reservations.forEach(reservation => {
      const room = this.rooms.find(r => r.id === reservation.roomId);
      if (room) {
        const typeDisplay = this.getRoomTypeDisplay(room.type);
        typeRevenue[typeDisplay] = (typeRevenue[typeDisplay] || 0) + (reservation.totalPrice || 0);
      }
    });

    this.revenueByRoomType = Object.entries(typeRevenue).map(([type, revenue]) => ({
      type,
      revenue,
      percentage: Math.round((revenue / this.totalRevenue) * 100)
    })).sort((a, b) => b.revenue - a.revenue);

    // Calculate monthly revenue (last 6 months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData: Record<string, number> = {};

    // Get current date and go back 6 months
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${monthNames[month.getMonth()]} ${month.getFullYear()}`;
      monthlyData[monthKey] = 0;
    }

    // Calculate revenue for each month
    this.reservations.forEach(reservation => {
      if (reservation.createdAt) {
        const date = new Date(reservation.createdAt);
        const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

        // Only include if it's within the last 6 months
        if (monthlyData[monthKey] !== undefined) {
          monthlyData[monthKey] += (reservation.totalPrice || 0);
        }
      }
    });

    this.monthlyRevenue = Object.entries(monthlyData).map(([month, revenue]) => ({
      month,
      revenue
    }));
  }

  processRecentBookings(): void {
    // Get the 5 most recent reservations
    this.recentBookings = this.reservations
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 5)
      .map(reservation => {
        // Find the room for this reservation
        const room = this.rooms.find(r => r.id === reservation.roomId);

        // Find the hotel for this room
        const hotel = room ? this.hotels.find(h => h.id === room.hotel) : null;

        return {
          id: reservation.id || `BK-${Math.floor(Math.random() * 10000)}`,
          guest: reservation.clientId || 'Guest',
          hotel: hotel?.name || 'Unknown Hotel',
          room: room?.name || 'Unknown Room',
          checkIn: this.formatDate(reservation.checkIn),
          checkOut: this.formatDate(reservation.checkOut),
          status: this.mapReservationStatus(reservation.status),
          amount: reservation.totalPrice || 0
        };
      });

    this.bookingsLoaded = true;
  }

  processUpcomingBookings(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get upcoming check-ins (next 7 days)
    this.upcomingCheckIns = this.reservations
      .filter(reservation => {
        if (!reservation.checkIn) return false;

        const checkInDate = new Date(reservation.checkIn);
        const diffTime = checkInDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays >= 0 && diffDays <= 7 && reservation.status === ReservationStatus.CONFIRMED;
      })
      .sort((a, b) => new Date(a.checkIn || 0).getTime() - new Date(b.checkIn || 0).getTime())
      .slice(0, 5)
      .map(reservation => {
        const room = this.rooms.find(r => r.id === reservation.roomId);
        const hotel = room ? this.hotels.find(h => h.id === room.hotel) : null;

        return {
          id: reservation.id || `BK-${Math.floor(Math.random() * 10000)}`,
          guest: reservation.clientId || 'Guest',
          hotel: hotel?.name || 'Unknown Hotel',
          room: room?.name || 'Unknown Room',
          checkIn: this.formatDate(reservation.checkIn),
          daysUntil: this.getDaysUntil(reservation.checkIn)
        };
      });

    // Get upcoming check-outs (next 7 days)
    this.upcomingCheckOuts = this.reservations
      .filter(reservation => {
        if (!reservation.checkOut) return false;

        const checkOutDate = new Date(reservation.checkOut);
        const diffTime = checkOutDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays >= 0 && diffDays <= 7 && reservation.status === ReservationStatus.CONFIRMED;
      })
      .sort((a, b) => new Date(a.checkOut || 0).getTime() - new Date(b.checkOut || 0).getTime())
      .slice(0, 5)
      .map(reservation => {
        const room = this.rooms.find(r => r.id === reservation.roomId);
        const hotel = room ? this.hotels.find(h => h.id === room.hotel) : null;

        return {
          id: reservation.id || `BK-${Math.floor(Math.random() * 10000)}`,
          guest: reservation.clientId || 'Guest',
          hotel: hotel?.name || 'Unknown Hotel',
          room: room?.name || 'Unknown Room',
          checkOut: this.formatDate(reservation.checkOut),
          daysUntil: this.getDaysUntil(reservation.checkOut)
        };
      });
  }

  calculateHotelOccupancy(): void {
    // Group rooms by hotel
    const roomsByHotel = this.rooms.reduce((acc, room) => {
      const hotelId = room.hotel;
      if (!acc[hotelId]) {
        acc[hotelId] = [];
      }
      acc[hotelId].push(room);
      return acc;
    }, {} as Record<string, RoomFormData[]>);

    // Calculate occupancy for each hotel
    this.hotelOccupancy = Object.entries(roomsByHotel).map(([hotelId, rooms]) => {
      const hotel = this.hotels.find(h => h.id === hotelId);

      // Count occupied rooms in this hotel
      const occupiedRooms = rooms.filter(room => room.status === RoomStatus.OCCUPIED).length;

      const occupancyRate = rooms.length > 0
        ? Math.round((occupiedRooms / rooms.length) * 100)
        : 0;

      return {
        id: hotelId,
        name: hotel?.name || 'Unknown Hotel',
        totalRooms: rooms.length,
        occupiedRooms,
        occupancy: occupancyRate
      };
    }).sort((a, b) => b.occupancy - a.occupancy);

    this.occupancyLoaded = true;
  }

  // Helper methods
  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  getDaysUntil(dateString?: string): string {
    if (!dateString) return 'N/A';

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const targetDate = new Date(dateString);
    targetDate.setHours(0, 0, 0, 0);

    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `In ${diffDays} days`;
  }

  mapReservationStatus(status?: ReservationStatus): "confirmed" | "pending" | "cancelled" {
    if (!status) return "pending";

    switch(status) {
      case ReservationStatus.CONFIRMED:
        return "confirmed";
      case ReservationStatus.PENDING:
        return "pending";
      case ReservationStatus.CANCELLED:
        return "cancelled";
      default:
        return "pending";
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  getRoomTypeDisplay(type: RoomType): string {
    switch(type) {
      case RoomType.SINGLE: return "Single";
      case RoomType.DOUBLE: return "Double";
      case RoomType.TWIN: return "Twin";
      case RoomType.SUITE: return "Suite";
      case RoomType.DELUXE: return "Deluxe";
      case RoomType.EXECUTIVE: return "Executive";
      case RoomType.FAMILY: return "Family";
      case RoomType.PRESIDENTIAL: return "Presidential";
      case RoomType.STUDIO: return "Studio";
      default: return "Unknown";
    }
  }

  getRoomStatusDisplay(status: RoomStatus): string {
    switch(status) {
      case RoomStatus.AVAILABLE: return "Available";
      case RoomStatus.OCCUPIED: return "Occupied";
      case RoomStatus.MAINTENANCE: return "Maintenance";
      case RoomStatus.RESERVED: return "Reserved";
      default: return "Unknown";
    }
  }

  getRoomStatusClass(status: RoomStatus): string {
    switch(status) {
      case RoomStatus.AVAILABLE: return "bg-green-100 text-green-800";
      case RoomStatus.OCCUPIED: return "bg-blue-100 text-blue-800";
      case RoomStatus.MAINTENANCE: return "bg-yellow-100 text-yellow-800";
      case RoomStatus.RESERVED: return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  }

  setPeriod(period: 'weekly' | 'monthly' | 'yearly'): void {
    this.selectedPeriod = period;
    // In a real app, you would refetch data for the selected period
  }

  toggleTaskStatus(index: number): void {
    this.tasks[index].completed = !this.tasks[index].completed;
  }

  // Calculate available rooms count
  getAvailableRoomsCount(): number {
    return this.rooms.filter(room => room.status === RoomStatus.AVAILABLE).length;
  }

  // Calculate average room price
  getAverageRoomPrice(): number {
    const totalPrice = this.rooms.reduce((sum, room) => sum + room.price, 0);
    return this.rooms.length > 0 ? Math.round(totalPrice / this.rooms.length) : 0;
  }

  // Calculate total hotels count
  getTotalHotelsCount(): number {
    return this.hotels.length;
  }

  // Calculate active hotels count
  getActiveHotelsCount(): number {
    return this.hotels.filter(hotel => hotel.status === 'active').length;
  }

  // Get most popular room type
  getMostPopularRoomType(): string {
    if (this.roomsByType.length === 0) return 'N/A';
    return this.roomsByType[0].type;
  }

  // Get highest revenue room type
  getHighestRevenueRoomType(): string {
    if (this.revenueByRoomType.length === 0) return 'N/A';
    return this.revenueByRoomType[0].type;
  }
}