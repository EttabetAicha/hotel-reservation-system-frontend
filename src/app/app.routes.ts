import { HotelListingComponent } from './features/user-interfaces/hotel-list/hotel-list.component';
import { Routes } from '@angular/router';
import { LandingPageComponent } from './features/user-interfaces/landing-page/landing-page.component';
import { AuthComponent } from './features/auth/auth.component';

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
  }
];
