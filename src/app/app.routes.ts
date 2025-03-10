import { HotelListingComponent } from './features/user-interfaces/hotel-list/hotel-list.component';
import { Routes } from '@angular/router';
import { LandingPageComponent } from './features/user-interfaces/landing-page/landing-page.component';
import { AuthComponent } from './features/auth/auth.component';
import { HotelDetailComponent } from './features/user-interfaces/hotel-details/hotel-details.component';
import { PaymentComponent } from './features/user-interfaces/payment/payment.component';
import { BookingsComponent } from './features/user-interfaces/booking/booking.component';
import { BookingDetailsComponent } from './features/user-interfaces/booking-details/booking-details.component';
import { AdminLayoutComponent } from './features/admin/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './features/admin/dashboard/dashboard.component';
import { AdminHotelsComponent } from './features/admin/hotels/hotels.component';
import { AdminRoomsComponent } from './features/admin/rooms/rooms.component';
import { AdminBookingsComponent } from './features/admin/bookings/bookings.component';
import { AdminNotificationsComponent } from './features/admin/notifications/notifications.component';

export const routes: Routes = [
  {
    path:'',
    component: LandingPageComponent
  }
  ,
  {
    path:'auth',
    component: AuthComponent
  }
  ,
  {
    path:'hotel-list',
    component: HotelListingComponent
  },
  {
    path: "hotel-details/:id",
    component: HotelDetailComponent,
  },
  {
    path: "payment",
    component: PaymentComponent,
  },
  {
    path: "bookings",
    component: BookingsComponent,
  },
  {
    path: "booking-details/:id",
    component: BookingDetailsComponent,
  },
  {
    path: "admin",
    component: AdminLayoutComponent,
    children: [
      {
        path: "",
        redirectTo: "dashboard",
        pathMatch: "full",
      },
      {
        path: "dashboard",
        component: AdminDashboardComponent,
      },
      {
        path: "hotels",
        component: AdminHotelsComponent,
      },
      {
        path: "rooms",
        component: AdminRoomsComponent,
      },
      {
        path: "bookings",
        component: AdminBookingsComponent,
      },
      {
        path: "notifications",
        component: AdminNotificationsComponent,
      },
    ],
  },
];
