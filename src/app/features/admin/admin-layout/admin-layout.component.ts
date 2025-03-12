import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import { AdminHeaderComponent } from "../admin-header/admin-header.component"
import { SidebarComponent } from "../admin-sidebar/admin-sidebar.component"

@Component({
  selector: "app-admin-layout",
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, AdminHeaderComponent],
  template: `
    <div class="flex h-screen bg-gray-100">
      <!-- Sidebar -->
      <app-sidebar [collapsed]="sidebarCollapsed"></app-sidebar>

      <!-- Main Content -->
      <div class="flex flex-col flex-1 overflow-hidden">
        <!-- Header -->
        <app-admin-header
          (toggleSidebar)="toggleSidebar()"
          [sidebarCollapsed]="sidebarCollapsed">
        </app-admin-header>

        <!-- Page Content -->
        <main class="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-100">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
})
export class AdminLayoutComponent implements OnInit {
  sidebarCollapsed = false

  constructor() {}

  ngOnInit(): void {
    // Check if sidebar state is saved in localStorage
    const savedState = localStorage.getItem("sidebarCollapsed")
    if (savedState) {
      this.sidebarCollapsed = JSON.parse(savedState)
    }

    // Adjust for mobile devices
    if (window.innerWidth < 768) {
      this.sidebarCollapsed = true
    }
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed
    localStorage.setItem("sidebarCollapsed", JSON.stringify(this.sidebarCollapsed))
  }
}

