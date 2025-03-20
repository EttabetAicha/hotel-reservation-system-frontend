import { Component, EventEmitter, Input, Output } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { AdminNotificationDropdownComponent } from "../admin-notification-dropdown/admin-notification-dropdown.component"
import { Router, RouterLink } from "@angular/router"

@Component({
  selector: "app-admin-header",
  standalone: true,
  imports: [CommonModule, FormsModule,AdminNotificationDropdownComponent ],
  templateUrl: "./admin-header.component.html",

})
export class AdminHeaderComponent {
  @Input() sidebarCollapsed = false
  userName: string | null = '';
  constructor(private router: Router) {}

  @Output() toggleSidebar = new EventEmitter<void>()
  isDropdownOpen = false;
  logout(): void {
    localStorage.removeItem('auth-token');
    this.userName = null;
    this.router.navigate(['/authentication/login']);
  }

  pageTitle = "Dashboard"
  pageSubtitle = "Hotel Management System"
}

