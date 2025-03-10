import { Component, EventEmitter, Input, Output } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { AdminNotificationDropdownComponent } from "../admin-notification-dropdown/admin-notification-dropdown.component"

@Component({
  selector: "app-admin-header",
  standalone: true,
  imports: [CommonModule, FormsModule,AdminNotificationDropdownComponent],
  templateUrl: "./admin-header.component.html",
})
export class AdminHeaderComponent {
  @Input() sidebarCollapsed = false
  @Output() toggleSidebar = new EventEmitter<void>()

  pageTitle = "Dashboard"
  pageSubtitle = "Hotel Management System"
}

