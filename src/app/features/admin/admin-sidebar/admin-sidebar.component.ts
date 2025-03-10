import { Component, Input } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"

interface NavItem {
  label: string
  icon: string
  route: string
  badge?: number
}

@Component({
  selector: "app-admin-sidebar",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl:"./admin-sidebar.component.html",
})
export class AdminSidebarComponent {
  @Input() collapsed = false

  navItems: NavItem[] = [
    { label: "Dashboard", icon: "fas fa-tachometer-alt", route: "/admin/dashboard" },
    { label: "Hotels", icon: "fas fa-hotel", route: "/admin/hotels" },
    { label: "Rooms", icon: "fas fa-door-open", route: "/admin/rooms" },
    { label: "Bookings", icon: "fas fa-calendar-check", route: "/admin/bookings", badge: 5 },
    { label: "Customers", icon: "fas fa-users", route: "/admin/customers" },
    { label: "Reviews", icon: "fas fa-star", route: "/admin/reviews", badge: 2 },
    { label: "Reports", icon: "fas fa-chart-bar", route: "/admin/reports" },
    { label: "Settings", icon: "fas fa-cog", route: "/admin/settings" },
  ]
}

