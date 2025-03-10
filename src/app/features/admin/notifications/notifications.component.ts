import { Component, type OnInit, type OnDestroy } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import type { Subscription } from "rxjs"
import { AdminNotificationService, type Notification as AdminNotification } from "../../../core/services/admin-notification.service"

@Component({
  selector: "app-admin-notifications",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mx-auto">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Notifications</h1>
          <p class="text-gray-600">Manage your system notifications</p>
        </div>
        <div class="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
          <button
            *ngIf="unreadCount > 0"
            (click)="markAllAsRead()"
            class="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors duration-300"
          >
            Mark all as read
          </button>
          <button
            (click)="clearAllNotifications()"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-300"
          >
            Clear all
          </button>
        </div>
      </div>

      <!-- Notification Filters -->
      <div class="bg-white rounded-lg shadow-md p-4 mb-6">
        <div class="flex flex-wrap gap-2">
          <button
            (click)="setFilter('all')"
            [class.bg-indigo-600]="activeFilter === 'all'"
            [class.text-white]="activeFilter === 'all'"
            [class.bg-gray-100]="activeFilter !== 'all'"
            [class.text-gray-700]="activeFilter !== 'all'"
            class="px-4 py-2 rounded-md transition-colors duration-200"
          >
            All
          </button>
          <button
            (click)="setFilter('unread')"
            [class.bg-indigo-600]="activeFilter === 'unread'"
            [class.text-white]="activeFilter === 'unread'"
            [class.bg-gray-100]="activeFilter !== 'unread'"
            [class.text-gray-700]="activeFilter !== 'unread'"
            class="px-4 py-2 rounded-md transition-colors duration-200"
          >
            Unread
          </button>
          <button
            (click)="setFilter('booking')"
            [class.bg-indigo-600]="activeFilter === 'booking'"
            [class.text-white]="activeFilter === 'booking'"
            [class.bg-gray-100]="activeFilter !== 'booking'"
            [class.text-gray-700]="activeFilter !== 'booking'"
            class="px-4 py-2 rounded-md transition-colors duration-200"
          >
            Bookings
          </button>
          <button
            (click)="setFilter('system')"
            [class.bg-indigo-600]="activeFilter === 'system'"
            [class.text-white]="activeFilter === 'system'"
            [class.bg-gray-100]="activeFilter !== 'system'"
            [class.text-gray-700]="activeFilter !== 'system'"
            class="px-4 py-2 rounded-md transition-colors duration-200"
          >
            System
          </button>
          <button
            (click)="setFilter('alert')"
            [class.bg-indigo-600]="activeFilter === 'alert'"
            [class.text-white]="activeFilter === 'alert'"
            [class.bg-gray-100]="activeFilter !== 'alert'"
            [class.text-gray-700]="activeFilter !== 'alert'"
            class="px-4 py-2 rounded-md transition-colors duration-200"
          >
            Alerts
          </button>
        </div>
      </div>

      <!-- Notifications List -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div *ngIf="filteredNotifications.length === 0" class="p-8 text-center text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <p class="text-lg font-medium">No notifications found</p>
          <p class="mt-1">{{ getEmptyStateMessage() }}</p>
        </div>

        <div *ngIf="filteredNotifications.length > 0">
          <div
            *ngFor="let notification of filteredNotifications"
            class="p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors duration-200"
            [class.bg-indigo-50]="!notification.isRead"
          >
            <div class="flex items-start">
              <div
                [class]="getNotificationIconClass(notification.type)"
                class="rounded-full p-3 mr-4 flex-shrink-0"
              >
                <svg *ngIf="notification.type === 'booking'" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <svg *ngIf="notification.type === 'system'" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <svg *ngIf="notification.type === 'alert'" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <svg *ngIf="notification.type === 'info'" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="flex-1">
                <div class="flex justify-between items-start">
                  <div>
                    <h3 class="text-lg font-medium text-gray-900">{{ notification.title }}</h3>
                    <p class="text-gray-600 mt-1">{{ notification.message }}</p>
                  </div>
                  <div class="flex flex-col items-end">
                    <span class="text-sm text-gray-500">{{ formatDate(notification.createdAt) }}</span>
                    <div class="flex mt-2 space-x-2">
                      <button
                        *ngIf="!notification.isRead"
                        (click)="markAsRead(notification.id)"
                        class="text-xs text-indigo-600 hover:text-indigo-800"
                      >
                        Mark as read
                      </button>
                      <button
                        *ngIf="notification.link"
                        (click)="navigateToLink(notification.link)"
                        class="text-xs text-gray-600 hover:text-gray-800"
                      >
                        View details
                      </button>
                      <button
                        (click)="deleteNotification(notification.id)"
                        class="text-xs text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AdminNotificationsComponent implements OnInit, OnDestroy {
  notifications: AdminNotification[] = []
  filteredNotifications: AdminNotification[] = []
  unreadCount = 0
  activeFilter: "all" | "unread" | "booking" | "system" | "alert" | "info" = "all"
  private subscriptions: Subscription[] = []

  constructor(private notificationService: AdminNotificationService) {}

  ngOnInit(): void {
    // Subscribe to notifications
    this.subscriptions.push(
      this.notificationService.getNotifications().subscribe((notifications) => {
        this.notifications = notifications
        this.applyFilter()
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

  setFilter(filter: "all" | "unread" | "booking" | "system" | "alert" | "info"): void {
    this.activeFilter = filter
    this.applyFilter()
  }

  applyFilter(): void {
    switch (this.activeFilter) {
      case "unread":
        this.filteredNotifications = this.notifications.filter((n) => !n.isRead)
        break
      case "booking":
      case "system":
      case "alert":
      case "info":
        this.filteredNotifications = this.notifications.filter((n) => n.type === this.activeFilter)
        break
      default:
        this.filteredNotifications = [...this.notifications]
    }
  }

  markAsRead(id: string): void {
    this.notificationService.markAsRead(id)
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead()
  }

  deleteNotification(id: string): void {
    this.notificationService.deleteNotification(id)
  }

  clearAllNotifications(): void {
    if (confirm("Are you sure you want to clear all notifications?")) {
      this.notificationService.clearAllNotifications()
    }
  }

  navigateToLink(link: string): void {
    // Router navigation would happen here
    console.log("Navigate to:", link)
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

  formatDate(date: Date): string {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    })
  }

  getEmptyStateMessage(): string {
    switch (this.activeFilter) {
      case "unread":
        return "You have no unread notifications"
      case "booking":
        return "You have no booking notifications"
      case "system":
        return "You have no system notifications"
      case "alert":
        return "You have no alert notifications"
      case "info":
        return "You have no info notifications"
      default:
        return "You have no notifications"
    }
  }
}

