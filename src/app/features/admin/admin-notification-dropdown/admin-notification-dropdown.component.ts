import { Component, type OnInit, type OnDestroy } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import type { Subscription } from "rxjs"
import { AdminNotificationService, type Notification } from "../../../core/services/admin-notification.service"

@Component({
  selector: "app-admin-notification-dropdown",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="relative">
      <!-- Notification Bell -->
      <button
        (click)="toggleDropdown()"
        class="text-gray-500 hover:text-gray-700 focus:outline-none relative"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <span
          *ngIf="unreadCount > 0"
          class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
        >
          {{ unreadCount > 9 ? '9+' : unreadCount }}
        </span>
      </button>

      <!-- Dropdown Panel -->
      <div
        *ngIf="isOpen"
        class="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20"
      >
        <div class="py-2">
          <div class="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
            <h3 class="text-sm font-semibold text-gray-700">Notifications</h3>
            <div class="flex space-x-2">
              <button
                *ngIf="unreadCount > 0"
                (click)="markAllAsRead()"
                class="text-xs text-indigo-600 hover:text-indigo-800"
              >
                Mark all as read
              </button>
              <button
                (click)="viewAllNotifications()"
                class="text-xs text-gray-600 hover:text-gray-800"
              >
                View all
              </button>
            </div>
          </div>

          <div *ngIf="notifications.length === 0" class="px-4 py-6 text-center text-gray-500">
            No notifications
          </div>

          <div *ngIf="notifications.length > 0" class="max-h-80 overflow-y-auto">
            <div
              *ngFor="let notification of notifications.slice(0, 5)"
              class="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              [class.bg-indigo-50]="!notification.isRead"
              (click)="onNotificationClick(notification)"
            >
              <div class="flex items-start">
                <div
                  [class]="getNotificationIconClass(notification.type)"
                  class="rounded-full p-2 mr-3 flex-shrink-0"
                >
                  <svg *ngIf="notification.type === 'booking'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <svg *ngIf="notification.type === 'system'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <svg *ngIf="notification.type === 'alert'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <svg *ngIf="notification.type === 'info'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div class="flex-1">
                  <div class="flex justify-between items-start">
                    <p class="text-sm font-medium text-gray-900">{{ notification.title }}</p>
                    <span class="text-xs text-gray-500">{{ getTimeAgo(notification.createdAt) }}</span>
                  </div>
                  <p class="text-xs text-gray-600 mt-1">{{ notification.message }}</p>
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="notifications.length > 5" class="px-4 py-2 border-t border-gray-200 text-center">
            <button
              (click)="viewAllNotifications()"
              class="text-sm text-indigo-600 hover:text-indigo-800"
            >
              View all {{ notifications.length }} notifications
            </button>
          </div>
        </div>
      </div>

      <!-- Overlay to close dropdown when clicking outside -->
      <div
        *ngIf="isOpen"
        class="fixed inset-0 z-10"
        (click)="closeDropdown()"
      ></div>
    </div>
  `,
})
export class AdminNotificationDropdownComponent implements OnInit, OnDestroy {
  notifications: Notification[] = []
  unreadCount = 0
  isOpen = false
  private subscriptions: Subscription[] = []

  constructor(private notificationService: AdminNotificationService) {}

  ngOnInit(): void {
    // Subscribe to notifications
    this.subscriptions.push(
      this.notificationService.getNotifications().subscribe((notifications) => {
        this.notifications = notifications
      }),
    )

    // Subscribe to unread count
    this.subscriptions.push(
      this.notificationService.getUnreadCount().subscribe((count) => {
        this.unreadCount = count
      }),
    )
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    this.subscriptions.forEach((sub) => sub.unsubscribe())
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen
  }

  closeDropdown(): void {
    this.isOpen = false
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead()
  }

  onNotificationClick(notification: Notification): void {
    // Mark as read
    this.notificationService.markAsRead(notification.id)

    // Close dropdown
    this.closeDropdown()

    // Navigate to link if provided
    if (notification.link) {
      // Router navigation would happen here
      console.log("Navigate to:", notification.link)
    }
  }

  viewAllNotifications(): void {
    // Navigate to notifications page
    console.log("Navigate to all notifications")
    this.closeDropdown()
  }

  getNotificationIconClass(type: string): string {
    switch (type) {
      case "booking":
        return "bg-indigo-100 text-indigo-600"
      case "system":
        return "bg-blue-100 text-blue-600"
      case "alert":
        return "bg-red-100 text-red-600"
      case "info":
        return "bg-green-100 text-green-600"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  getTimeAgo(date: Date): string {
    const now = new Date()
    const diffMs = now.getTime() - new Date(date).getTime()
    const diffSec = Math.round(diffMs / 1000)
    const diffMin = Math.round(diffSec / 60)
    const diffHour = Math.round(diffMin / 60)
    const diffDay = Math.round(diffHour / 24)

    if (diffSec < 60) {
      return "just now"
    } else if (diffMin < 60) {
      return `${diffMin}m ago`
    } else if (diffHour < 24) {
      return `${diffHour}h ago`
    } else if (diffDay === 1) {
      return "yesterday"
    } else {
      return `${diffDay}d ago`
    }
  }
}

