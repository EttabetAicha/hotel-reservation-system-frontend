import { Injectable } from "@angular/core"
import { BehaviorSubject, type Observable } from "rxjs"

export interface Notification {
  id: string
  title: string
  message: string
  type: "booking" | "system" | "alert" | "info"
  isRead: boolean
  createdAt: Date
  link?: string
}

@Injectable({
  providedIn: "root",
})
export class AdminNotificationService {
  private notifications: Notification[] = []
  private notificationsSubject = new BehaviorSubject<Notification[]>([])
  private unreadCountSubject = new BehaviorSubject<number>(0)

  constructor() {
    // Initialize with mock notifications
    this.loadMockNotifications()
    this.updateUnreadCount()
  }

  getNotifications(): Observable<Notification[]> {
    return this.notificationsSubject.asObservable()
  }

  getUnreadCount(): Observable<number> {
    return this.unreadCountSubject.asObservable()
  }

  addNotification(notification: Omit<Notification, "id" | "createdAt">): void {
    const newNotification: Notification = {
      ...notification,
      id: this.generateId(),
      createdAt: new Date(),
    }

    this.notifications.unshift(newNotification)
    this.notificationsSubject.next([...this.notifications])
    this.updateUnreadCount()
  }

  markAsRead(id: string): void {
    const notification = this.notifications.find((n) => n.id === id)
    if (notification) {
      notification.isRead = true
      this.notificationsSubject.next([...this.notifications])
      this.updateUnreadCount()
    }
  }

  markAllAsRead(): void {
    this.notifications.forEach((notification) => {
      notification.isRead = true
    })
    this.notificationsSubject.next([...this.notifications])
    this.updateUnreadCount()
  }

  deleteNotification(id: string): void {
    this.notifications = this.notifications.filter((n) => n.id !== id)
    this.notificationsSubject.next([...this.notifications])
    this.updateUnreadCount()
  }

  clearAllNotifications(): void {
    this.notifications = []
    this.notificationsSubject.next([])
    this.updateUnreadCount()
  }

  private updateUnreadCount(): void {
    const unreadCount = this.notifications.filter((n) => !n.isRead).length
    this.unreadCountSubject.next(unreadCount)
  }

  private generateId(): string {
    return "notif-" + Math.random().toString(36).substr(2, 9)
  }

  private loadMockNotifications(): void {
    this.notifications = [
      {
        id: this.generateId(),
        title: "New Booking",
        message: "John Smith has made a new booking at Grand Plaza Hotel",
        type: "booking",
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        link: "/admin/bookings",
      },
      {
        id: this.generateId(),
        title: "Booking Cancelled",
        message: "Sarah Johnson has cancelled her booking at Seaside Resort",
        type: "alert",
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        link: "/admin/bookings",
      },
      {
        id: this.generateId(),
        title: "System Update",
        message: "The system will undergo maintenance tonight at 2:00 AM",
        type: "system",
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      },
      {
        id: this.generateId(),
        title: "Low Inventory Alert",
        message: "Only 2 rooms left at Mountain View Lodge for the weekend",
        type: "alert",
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
        link: "/admin/rooms",
      },
      {
        id: this.generateId(),
        title: "New Review",
        message: "A new 5-star review has been submitted for Urban Loft Suites",
        type: "info",
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        link: "/admin/reviews",
      },
      {
        id: this.generateId(),
        title: "Payment Received",
        message: "Payment of $1,250 received for booking #BK-12350",
        type: "booking",
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
        link: "/admin/bookings",
      },
    ]
    this.notificationsSubject.next([...this.notifications])
  }
}

