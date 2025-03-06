import { HotelListingComponent } from './features/user-interfaces/hotel-list/hotel-list.component';
import { Routes } from '@angular/router';
import { LandingPageComponent } from './features/user-interfaces/landing-page/landing-page.component';
import { AuthComponent } from './features/auth/auth.component';
import { HotelDetailComponent } from './features/user-interfaces/hotel-details/hotel-details.component';
import { PaymentComponent } from './features/user-interfaces/payment/payment.component';

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
    redirectTo: "/hotel-list",
    pathMatch: "full",
  },
];
