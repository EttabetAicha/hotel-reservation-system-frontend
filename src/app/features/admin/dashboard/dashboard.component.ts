import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"

interface Stat {
  label: string
  value: string
  change: string
  increased: boolean
  icon: string
  iconBg: string
}

interface RecentBooking {
  id: string
  guest: string
  hotel: string
  room: string
  checkIn: string
  checkOut: string
  status: "confirmed" | "pending" | "cancelled"
  amount: number
}

@Component({
  selector: "app-admin-dashboard",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./dashboard.component.html",
})
export class AdminDashboardComponent implements OnInit {
  stats: Stat[] = [
    {
      label: "Total Bookings",
      value: "1,248",
      change: "12%",
      increased: true,
      icon: "fas fa-calendar-check",
      iconBg: "bg-indigo-500",
    },
    {
      label: "Revenue",
      value: "$34,742",
      change: "8%",
      increased: true,
      icon: "fas fa-dollar-sign",
      iconBg: "bg-green-500",
    },
    {
      label: "Occupancy Rate",
      value: "78%",
      change: "3%",
      increased: true,
      icon: "fas fa-bed",
      iconBg: "bg-blue-500",
    },
    {
      label: "Cancellations",
      value: "42",
      change: "5%",
      increased: false,
      icon: "fas fa-times-circle",
      iconBg: "bg-red-500",
    },
  ]

  recentBookings: RecentBooking[] = [
    {
      id: "BK-12345",
      guest: "John Smith",
      hotel: "Grand Plaza Hotel",
      room: "Deluxe Room",
      checkIn: "Oct 15, 2023",
      checkOut: "Oct 18, 2023",
      status: "confirmed",
      amount: 450,
    },
    {
      id: "BK-12346",
      guest: "Sarah Johnson",
      hotel: "Seaside Resort",
      room: "Executive Suite",
      checkIn: "Oct 20, 2023",
      checkOut: "Oct 25, 2023",
      status: "pending",
      amount: 1200,
    },
    {
      id: "BK-12347",
      guest: "Michael Brown",
      hotel: "Urban Loft Suites",
      room: "Standard Room",
      checkIn: "Oct 10, 2023",
      checkOut: "Oct 12, 2023",
      status: "cancelled",
      amount: 280,
    },
    {
      id: "BK-12348",
      guest: "Emily Davis",
      hotel: "Mountain View Lodge",
      room: "Family Room",
      checkIn: "Oct 22, 2023",
      checkOut: "Oct 26, 2023",
      status: "confirmed",
      amount: 850,
    },
    {
      id: "BK-12349",
      guest: "David Wilson",
      hotel: "Grand Plaza Hotel",
      room: "Luxury Suite",
      checkIn: "Oct 18, 2023",
      checkOut: "Oct 21, 2023",
      status: "confirmed",
      amount: 720,
    },
  ]

  hotelOccupancy = [
    { name: "Grand Plaza Hotel", occupancy: 85 },
    { name: "Seaside Resort", occupancy: 72 },
    { name: "Urban Loft Suites", occupancy: 65 },
    { name: "Mountain View Lodge", occupancy: 90 },
  ]

  tasks = [
    { text: "Review new booking requests", completed: false },
    { text: "Update room availability for weekend", completed: true },
    { text: "Respond to customer inquiries", completed: false },
    { text: "Schedule maintenance for Room 302", completed: false },
    { text: "Review monthly revenue report", completed: true },
  ]

  constructor() {}

  ngOnInit(): void {}

  getStatusClass(status: string): string {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }
}

